const isContextValid = () => {
  try { return !!chrome.runtime?.id; } catch { return false; }
};

interface DeviceUserData {
  userName: string;
  token: string;
  cohort: string;
}

const ANNOUNCE_DELAYS_MS = [0, 300, 1000];

const postDeviceSignedIn = (userData: DeviceUserData) => {
  window.postMessage({
    deviceSignedIn: {
      value: true,
      userData,
      capabilities: {}
    }
  }, window.location.origin);
};

const announceStoredCredentials = () => {
  if (!isContextValid()) return;

  chrome.storage.local.get('user_data', (result) => {
    if (chrome.runtime.lastError) return;

    const userData = result.user_data;
    if (!userData?.user?.access_token || !userData?.user?.username) return;

    const payload: DeviceUserData = {
      userName: userData.user.username,
      token: userData.user.access_token,
      cohort: userData.user.cohort || ''
    };

    ANNOUNCE_DELAYS_MS.forEach(delay => {
      setTimeout(() => postDeviceSignedIn(payload), delay);
    });
  });
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.action !== 'ddg-auth') return;
  announceStoredCredentials();
});

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return;

  const addUserData = event.data?.addUserData;
  if (addUserData) {
    if (!addUserData.userName || !addUserData.token) return;

    postDeviceSignedIn({
      userName: addUserData.userName,
      token: addUserData.token,
      cohort: addUserData.cohort || ''
    });
    return;
  }

  if (event.data?.type !== 'qwacky-auth-token') return;
  if (!isContextValid()) return;

  const { token, username } = event.data;
  if (!token) return;

  chrome.storage.local.get('awaiting_signup_auto_login', (result) => {
    if (chrome.runtime.lastError || !result.awaiting_signup_auto_login) return;
    chrome.storage.local.remove('awaiting_signup_auto_login');
    chrome.runtime.sendMessage({
      action: 'auto-login',
      token,
      username
    });
  });
});

announceStoredCredentials();

export {};
