import { keyNotification } from './application-server-key.js';

let swRegistration = null;

const updateSubscriptionOnServer = async () => {
  const publicKeys = window.localStorage.getItem('public-keys');

  if (!publicKeys) {
    const pushSubscription = await swRegistration.pushManager.getSubscription();
    await pushSubscription.unsubscribe();
    await subscribeUser();
  }
};

const subscribeUser = async () => {
  try {
    const infoSubscription = await keyNotification(swRegistration);

    if (infoSubscription) {
      await updateSubscriptionOnServer(infoSubscription.subscription);
    }
    console.log('User is subscribed. --- subscribeUser');
  } catch (error) {
    console.error('Error subscribing', error);
  }
};

const unsubscribeUser = async () => {
  try {
    const pushSubscription = await swRegistration.pushManager.getSubscription();

    if (pushSubscription) {
      await pushSubscription.unsubscribe();
    }

    window.localStorage.removeItem('public-keys');
    await updateSubscriptionOnServer(null);
    console.log('User is unsubscribed. --- unsubscribeUser');
  } catch (error) {
    console.error('Error unsubscribing', error);
  }
};

const initCookiePage = () => {
  const listCookies = document.cookie.split(';').reduce((total, cookie) => {
    const [key, value] = cookie.split('=');
    return { ...total, [key.trim()]: value };
  }, {});

  if (!listCookies.token_christmas) {
    window.localStorage.removeItem('public-keys');
  }
};

const initializeUI = async () => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported in this browser');
    await updateSubscriptionOnServer(null);
    return;
  }

  initCookiePage();

  const pushSubscription = await swRegistration.pushManager.getSubscription();
  const isSubscribed = !(pushSubscription === null);
  if (isSubscribed && Notification.permission === 'granted') {
    const updateSubscription = await updateSubscriptionOnServer(pushSubscription);

    return updateSubscription;
  }

  Notification.requestPermission(async status => {
    switch (status) {
      case 'granted':
        await subscribeUser();
        break;
      case 'default':
      case 'denied':
        await unsubscribeUser();
        break;
    }
  });
};

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker is supported!');
  navigator.serviceWorker.register('../sw.js')
    .then(async swReg => {
      swRegistration = swReg;
      await initializeUI();
    })
    .catch(error => {
      console.error('Service Worker Error', error);
    });
} else {
  console.warn('Service Worker is not supported');
}


