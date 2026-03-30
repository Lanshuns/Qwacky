const isContextValid = () => {
  try { return !!chrome.runtime?.id; } catch { return false; }
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.action !== 'ddg-auth' || !isContextValid()) return;

  chrome.storage.local.get('user_data', (result) => {
    if (chrome.runtime.lastError) return;
    const userData = result.user_data;
    if (!userData?.user?.access_token || !userData?.user?.username) return;

    window.postMessage({
      deviceSignedIn: {
        value: true,
        userData: {
          userName: userData.user.username,
          token: userData.user.access_token,
          cohort: userData.user.cohort || ''
        },
        capabilities: {}
      }
    }, window.location.origin);
  });
});

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return;
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

export {};
