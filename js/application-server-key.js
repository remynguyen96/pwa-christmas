const base64UrlToUint8Array = base64UrlData => {
  const padding = '='.repeat((4 - base64UrlData.length % 4) % 4);
  const base64 = (base64UrlData + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const buffer = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    buffer[i] = rawData.charCodeAt(i);
  }
  return buffer;
};

export const keyNotification = async (swRegistration) => {
  try {
    const { publicKey, token, expire } = await fetchApi({
      url: '/api/generate-keys',
    });
    const applicationServerKey = base64UrlToUint8Array(publicKey);
    const subscribePush = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
    const subscription = await subscribePush.toJSON();
    await fetchApi({
      url: '/api/save-endpoint',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: { publicKey, subscription },
      isResponse: false
    });

    window.localStorage.setItem('public-keys', publicKey);
    const timeExpire = new Date();
    timeExpire.setTime(timeExpire.getTime() + expire * 1000);
    document.cookie = `token_christmas=${token};expires=${timeExpire.toUTCString()};path=/`;

    return {
      publicKey,
      subscription,
    };
  } catch (err) {
    throw new Error(err);
  }
};

const handleHeaders = ({ token, headers }) => {
  const customHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...headers,
  };
  if (!token) {
    return new Headers({ ...customHeaders });
  }

  return new Headers({
    Authorization: `Bearer ${token}`,
    ...customHeaders,
  });
};

const handleOptions = ({ method, body, headers }) => {
  if (Object.is(method, 'GET')) {
    return { method };
  }
  return {
    method,
    headers,
    body: JSON.stringify(body),
    timeout: 10000,
  };
};

const fetchApi = async ({
  url,
  method = 'GET',
  token = null,
  body = null,
  headers = {},
  isResponse = true,
}) => {
  try {
    const finalHeaders = handleHeaders({ token, headers });
    const options = handleOptions({ method, headers: finalHeaders, body });
    const fetchApi = await fetch(url, options);
    let response;

    if (isResponse) {
      response = await fetchApi.json();
    }

    return response;
  } catch (err) {
    throw new Error(err);
  }
};

