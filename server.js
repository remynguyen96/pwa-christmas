const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const { verify, sign } = require('jsonwebtoken');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { CronJob } = require('cron');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', express.static('./public'));
const TOKEN_SECRET = 'SANTA_CLAUSE';

const adapter = new FileSync('notification.json');
const db = low(adapter);
const timeLive = 12 * 60 * 60; // 12 hour in seconds;

const randomQuote = (max = 10, min = 0) => {
  const randomNumber = Math.random() * (max - min) + min;

  return Math.floor(randomNumber);
};

const job = new CronJob('* */5 * * * *', async () => {
  const dataNotify = await db.get('notification').value();
  const allQuotes = await db.get('christmas-quotes').value();
  let options = {
    vapidDetails: {
      gcmAPIKey: '310655728905',
      subject: 'mailto:remynguyen96@gmail.com',
    },
    TTL: timeLive
  };
  let msg = { title: 'Merry Christmas' };

  for (const item of dataNotify) {
    const { publicKey, privateKey, subscription } = item;
    const index = randomQuote(allQuotes.length);
    const { author, quote } = allQuotes[index];
    const { vapidDetails } = options;

    options.vapidDetails = { ...vapidDetails, privateKey, publicKey };
    msg = { ...msg, author, quote };

    await webpush.sendNotification(
      subscription,
      JSON.stringify(msg),
      options
    );
  }
}, null, true, 'Asia/Ho_Chi_Minh');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Access-Token, X-Refresh-Token');
  next();
});

app.get('/api/generate-keys', (req, res) => {
  const { publicKey, privateKey } = webpush.generateVAPIDKeys();
  db.defaults({ notification: [] }).write();
  db.get('notification').push({ publicKey, privateKey, subscription: {} })
    .write();

  const token = sign(
    { publicKey },
    TOKEN_SECRET,
    {
      expiresIn: '12h',
      header: { typ: 'Bearer', alg: 'HS512' },
    }
  );

  return res.status(200).json({
    token,
    publicKey,
    expire: timeLive,
  });
});

const sendNotification = async dataNotify => {
  const { publicKey, privateKey, subscription } = dataNotify;
  const allQuotes = db.get('christmas-quotes').value();
  const index = randomQuote(allQuotes.length);
  const { author, quote } = allQuotes[index];

  const options = {
    vapidDetails: {
      privateKey,
      publicKey,
      gcmAPIKey: '310655728905',
      subject: 'mailto:remynguyen96@gmail.com',
    },
    TTL: timeLive
  };
  const msg = JSON.stringify({
    title: 'Merry Christmas',
    author,
    quote,
  });

  const resultNotify = await webpush.sendNotification(
    subscription,
    msg,
    options
  );

  return resultNotify;
};

app.post('/api/save-endpoint', async (req, res) => {
  const { subscription } = req.body;
  const { authorization } = req.headers;

  if (authorization) {
    const token = authorization.split('Bearer ')[1];
    const { publicKey } = verify(token, TOKEN_SECRET, (err, decoded) => {
      if (err) throw err;
      return decoded;
    });

    const dataNotify = db.get('notification')
      .find({ publicKey })
      .assign({ subscription: { ...subscription, expirationTime: timeLive } })
      .write();

    await sendNotification(dataNotify);

    return res.sendStatus(201);
  }

  return res.sendStatus(200);
});

app.post('/api/send-push-msg', async (req, res) => {
  try {
    const { publicKey } = req.body;
    const dataNotify = db.get('notification').find({ publicKey }).value();

    if (dataNotify) {
      const { publicKey, privateKey, subscription } = dataNotify;
      const allQuotes = db.get('christmas-quotes').value();
      const index = randomQuote(allQuotes.length);
      const { author, quote } = allQuotes[index];

      const options = {
        vapidDetails: {
          privateKey,
          publicKey,
          gcmAPIKey: '310655728905',
          subject: 'mailto:remynguyen96@gmail.com',
        },
        TTL: timeLive
      };
      const msg = JSON.stringify({
        title: 'Merry Christmas',
        author,
        quote,
      });

      await webpush.sendNotification(
        subscription,
        msg,
        options
      );

      return res.sendStatus(200);
    }
  } catch (err) {
    if (err.statusCode) {
      res.status(err.statusCode).send(err.body);
    } else {
      res.status(400).send(err.message);
    }
  }
});

// Start the server
const server = app.listen(process.env.PORT || 8080, () => {
  const port = server.address().port;
  console.log(`App listening on port: ${port}`);
  console.log('Press Ctrl+C to quit.');
});

server.on('connection', socket => {
  socket.setTimeout(1800 * 1000);
});
// [END app]
