chrome.runtime.onMessage.addListener((message) => {
  if (message.action !== 'ddg-auth') return;

  chrome.storage.local.get('user_data', (result) => {
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

export {};
