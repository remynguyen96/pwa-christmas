let deferredPrompt;
let btnInstall;

const addDomToApp = element => {
  const container = document.getElementById('appChristmas');
  container.insertBefore(element, container.firstChild);
};

const requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

const Fireworks = (function () {

  // declare the variables we need
  let particles = [],
    mainCanvas = null,
    mainContext = null,
    fireworkCanvas = null,
    fireworkContext = null,
    viewportWidth = 0,
    viewportHeight = 0;

  /**
   * Create DOM elements and get your game on
   */
  function initialize() {

    // start by measuring the viewport
    onWindowResize();

    // create a canvas for the fireworks
    mainCanvas = document.createElement('canvas');
    mainContext = mainCanvas.getContext('2d');

    // and another one for, like, an off screen buffer
    // because that's rad n all
    fireworkCanvas = document.createElement('canvas');
    fireworkContext = fireworkCanvas.getContext('2d');

    // set up the colours for the fireworks
    createFireworkPalette(12);

    // set the dimensions on the canvas
    setMainCanvasDimensions();

    // add the canvas in
    addDomToApp(mainCanvas);
    document.addEventListener('mouseup', createFirework, true);
    document.addEventListener('touchend', createFirework, true);

    // and now we set off
    update();
  }

  /**
   * Pass through function to create a
   * new firework on touch / click
   */
  function createFirework() {
    createParticle();
  }

  /**
   * Creates a block of colours for the
   * fireworks to use as their colouring
   */
  function createFireworkPalette(gridSize) {

    const size = gridSize * 10;
    fireworkCanvas.width = size;
    fireworkCanvas.height = size;
    fireworkContext.globalCompositeOperation = 'source-over';

    // create 100 blocks which cycle through
    // the rainbow... HSL is teh r0xx0rz
    for (let c = 0; c < 100; c++) {

      const marker = (c * gridSize);
      const gridX = marker % size;
      const gridY = Math.floor(marker / size) * gridSize;

      fireworkContext.fillStyle = 'hsl(' + Math.round(c * 3.6) + ',100%,60%)';
      fireworkContext.fillRect(gridX, gridY, gridSize, gridSize);
      fireworkContext.drawImage(
        Library.bigGlow,
        gridX,
        gridY);
    }
  }

  /**
   * Update the canvas based on the
   * detected viewport size
   */
  function setMainCanvasDimensions() {
    mainCanvas.width = viewportWidth;
    mainCanvas.height = viewportHeight;
  }

  /**
   * The main loop where everything happens
   */
  function update() {
    requestAnimFrame(update);
    clearContext();
    drawFireworks();
  }

  /**
   * Clears out the canvas with semi transparent
   * black. The bonus of this is the trails effect we get
   */
  function clearContext() {
    mainContext.fillStyle = 'rgba(0,0,0,0.2)';
    mainContext.fillRect(0, 0, viewportWidth, viewportHeight);
    mainContext.clearRect(0, 0, viewportWidth, viewportHeight);
  }

  /**
   * Passes over all particles particles
   * and draws them
   */
  function drawFireworks() {
    let a = particles.length;

    while (a--) {
      const firework = particles[a];

      // if the update comes back as true
      // then our firework should explode
      if (firework.update()) {

        // kill off the firework, replace it
        // with the particles for the exploded version
        particles.splice(a, 1);

        // if the firework isn't using physics
        // then we know we can safely(!) explode it... yeah.
        if (!firework.usePhysics) {

          if (Math.random() < 0.8) {
            FireworkExplosions.star(firework);
          } else {
            FireworkExplosions.circle(firework);
          }
        }
      }

      // pass the canvas context and the firework
      // colours to the
      firework.render(mainContext, fireworkCanvas);
    }
  }

  /**
   * Creates a new particle / firework
   */
  function createParticle(pos, target, vel, color, usePhysics) {

    pos = pos || {};
    target = target || {};
    vel = vel || {};

    particles.push(
      new Particle(
        // position
        {
          x: pos.x || viewportWidth * 0.5,
          y: pos.y || viewportHeight + 10
        },

        // target
        {
          y: target.y || 150 + Math.random() * 100
        },

        // velocity
        {
          x: vel.x || Math.random() * 3 - 1.5,
          y: vel.y || 0
        },

        color || Math.floor(Math.random() * 100) * 12,

        usePhysics)
    );
  }

  /**
   * Callback for window resizing -
   * sets the viewport dimensions
   */
  function onWindowResize() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
  }

  // declare an API
  return {
    initialize,
    createParticle
  };

})();

/**
 * Represents a single point, so the firework being fired up
 * into the air, or a point in the exploded firework
 */
const Particle = function (pos, target, vel, marker, usePhysics) {

  // properties for animation
  // and colouring
  this.GRAVITY = 0.06;
  this.alpha = 1;
  this.easing = Math.random() * 0.02;
  this.fade = Math.random() * 0.1;
  this.gridX = marker % 120;
  this.gridY = Math.floor(marker / 120) * 12;
  this.color = marker;

  this.pos = {
    x: pos.x || 0,
    y: pos.y || 0
  };

  this.vel = {
    x: vel.x || 0,
    y: vel.y || 0
  };

  this.lastPos = {
    x: this.pos.x,
    y: this.pos.y
  };

  this.target = {
    y: target.y || 0
  };

  this.usePhysics = usePhysics || false;

};

/**
 * Functions that we'd rather like to be
 * available to all our particles, such
 * as updating and rendering
 */
Particle.prototype = {

  update: function () {

    this.lastPos.x = this.pos.x;
    this.lastPos.y = this.pos.y;

    if (this.usePhysics) {
      this.vel.y += this.GRAVITY;
      this.pos.y += this.vel.y;

      // since this value will drop below
      // zero we'll occasionally see flicker,
      // ... just like in real life! Woo! xD
      this.alpha -= this.fade;
    } else {

      const distance = (this.target.y - this.pos.y);

      // ease the position
      this.pos.y += distance * (0.03 + this.easing);

      // cap to 1
      this.alpha = Math.min(distance * distance * 0.00005, 1);
    }

    this.pos.x += this.vel.x;

    return (this.alpha < 0.005);
  },

  render: function (context, fireworkCanvas) {

    const x = Math.round(this.pos.x),
      y = Math.round(this.pos.y),
      xVel = (x - this.lastPos.x) * -5,
      yVel = (y - this.lastPos.y) * -5;

    context.save();
    context.globalCompositeOperation = 'lighter';
    context.globalAlpha = Math.random() * this.alpha;

    // draw the line from where we were to where
    // we are now
    context.fillStyle = 'rgba(255,255,255,0.3)';
    context.beginPath();
    context.moveTo(this.pos.x, this.pos.y);
    context.lineTo(this.pos.x + 1.5, this.pos.y);
    context.lineTo(this.pos.x + xVel, this.pos.y + yVel);
    context.lineTo(this.pos.x - 1.5, this.pos.y);
    context.closePath();
    context.fill();

    // draw in the images
    context.drawImage(fireworkCanvas,
      this.gridX, this.gridY, 12, 12,
      x - 6, y - 6, 12, 12);
    context.drawImage(Library.smallGlow, x - 3, y - 3);
    context.restore();
  }

};

/**
 * Stores references to the images that
 * we want to reference later on
 */
const createElementImg = (alt, src) => {
  const img = new Image();
  img.src = src;
  img.alt = img.title = alt;
  return img;
};

const Library = {
  bigGlow: createElementImg('Big Glow', '../images/big-glow.png'),
  smallGlow: createElementImg('Small Glow', '../images/small-glow.png'),
};

/**
 * Stores a collection of functions that
 * we can use for the firework explosions. Always
 * takes a firework (Particle) as its parameter
 */
const FireworkExplosions = {

  /**
   * Explodes in a roughly circular fashion
   */
  circle: function (firework) {

    let count = 100;
    const angle = (Math.PI * 2) / count;
    while (count--) {

      const randomVelocity = 4 + Math.random() * 4;
      const particleAngle = count * angle;

      Fireworks.createParticle(
        firework.pos,
        null,
        {
          x: Math.cos(particleAngle) * randomVelocity,
          y: Math.sin(particleAngle) * randomVelocity
        },
        firework.color,
        true);
    }
  },

  /**
   * Explodes in a star shape
   */
  star: function (firework) {

    // set up how many points the firework
    // should have as well as the velocity
    // of the exploded particles etc
    const points = 6 + Math.round(Math.random() * 15);
    const jump = 3 + Math.round(Math.random() * 7);
    const subdivisions = 10;
    const radius = 80;
    const randomVelocity = -(Math.random() * 3 - 6);

    let start = 0;
    let end = 0;
    const circle = Math.PI * 2;
    const adjustment = Math.random() * circle;

    do {

      // work out the start, end
      // and change values
      start = end;
      end = (end + jump) % points;

      const sAngle = (start / points) * circle - adjustment;
      const eAngle = ((start + jump) / points) * circle - adjustment;

      const startPos = {
        x: firework.pos.x + Math.cos(sAngle) * radius,
        y: firework.pos.y + Math.sin(sAngle) * radius
      };

      const endPos = {
        x: firework.pos.x + Math.cos(eAngle) * radius,
        y: firework.pos.y + Math.sin(eAngle) * radius
      };

      const diffPos = {
        x: endPos.x - startPos.x,
        y: endPos.y - startPos.y,
        a: eAngle - sAngle
      };

      // now linearly interpolate across
      // the subdivisions to get to a final
      // set of particles
      for (let s = 0; s < subdivisions; s++) {

        const sub = s / subdivisions;
        const subAngle = sAngle + (sub * diffPos.a);

        Fireworks.createParticle(
          {
            x: startPos.x + (sub * diffPos.x),
            y: startPos.y + (sub * diffPos.y)
          },
          null,
          {
            x: Math.cos(subAngle) * randomVelocity,
            y: Math.sin(subAngle) * randomVelocity
          },
          firework.color,
          true);
      }

      // loop until we're back at the start
    } while (end !== 0);

  }

};

const EffectSnows = (() => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;

  const mp = 25; //max particles
  const particles = [];
  for (let i = 0; i < mp; i++) {
    particles.push({
      x: Math.random() * W, //x-coordinate
      y: Math.random() * H, //y-coordinate
      r: Math.random() * 4 + 1, //radius
      d: Math.random() * mp //density
    });
  }

  //Lets draw the flakes
  const draw = () => {
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    for (let i = 0; i < mp; i++) {
      const p = particles[i];
      ctx.moveTo(p.x, p.y);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
    }
    ctx.fill();
    update();
  };

  let angle = 0;

  const update = () => {
    angle += 0.0000001;
    for (let i = 0; i < mp; i++) {
      let p = particles[i];
      p.y += Math.cos(angle + p.d) + 1 + p.r / 2;
      p.x += Math.sin(angle) * 2;
      if (p.x > W + 5 || p.x < -5 || p.y > H) {
        if (i % 3 > 0) //66.67% of the flakes
        {
          particles[i] = { x: Math.random() * W, y: -10, r: p.r, d: p.d };
        } else {
          if (Math.sin(angle) > 0) {
            particles[i] = { x: -5, y: Math.random() * H, r: p.r, d: p.d };
          } else {
            particles[i] = { x: W + 5, y: Math.random() * H, r: p.r, d: p.d };
          }
        }
      }
    }
  };

  const updateDraw = () => {
    requestAnimFrame(draw);
    requestAnimFrame(updateDraw);
  };

  const initialize = () => {
    addDomToApp(canvas);
    updateDraw(); // or setInterval(draw, 33);
  };

  return { initialize };
})();

document.addEventListener('DOMContentLoaded', () => {
  const renderDom = `
    <h1 class="wished">
      Merry Christmas
    </h1>
    <figure>
      <img class="tree" src="../images/christmas-tree.png" title="Christmas Tree" alt="Christmas Tree">
    </figure>
  `;

  document.getElementById('appChristmas').innerHTML = renderDom;
});

window.addEventListener('load', () => {
  EffectSnows.initialize();
  Fireworks.initialize();
});

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  if (btnInstall) {
    document.body.removeChild(btnInstall);
  }
  btnInstall = document.createElement('button');
  btnInstall.innerText = '📲 Install';
  btnInstall.id = 'installBtn';
  btnInstall.remove();

  deferredPrompt = event;

  btnInstall.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          document.body.removeChild(btnInstall);
        }
        deferredPrompt = null;
      });
  });

  document.body.insertBefore(btnInstall, document.body.firstChild);
});
