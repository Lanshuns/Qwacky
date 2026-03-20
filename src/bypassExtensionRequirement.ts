(navigator as any).duckduckgo ??= {};

const postToken = (url: string, data: any) => {
  if (!data?.token) return;
  try {
    const urlObj = new URL(url);
    const username = urlObj.searchParams.get('user') || '';
    window.postMessage({
      type: 'qwacky-auth-token',
      token: data.token,
      username
    }, window.location.origin);
  } catch {}
};

const originalFetch = window.fetch;
window.fetch = async function (...args: Parameters<typeof fetch>) {
  const response = await originalFetch.apply(this, args);

  const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url;
  if (url && url.includes('quack.duckduckgo.com')) {
    try {
      const cloned = response.clone();
      const data = await cloned.json();
      postToken(url, data);
    } catch {}
  }

  return response;
};

const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...rest: any[]) {
  (this as any)._qwackyUrl = typeof url === 'string' ? url : url.toString();
  return originalOpen.apply(this, [method, url, ...rest] as any);
};

XMLHttpRequest.prototype.send = function (...args: any[]) {
  const url = (this as any)._qwackyUrl as string | undefined;
  if (url && url.includes('quack.duckduckgo.com')) {
    this.addEventListener('load', function () {
      try {
        const data = JSON.parse(this.responseText);
        postToken(url, data);
      } catch {}
    });
  }
  return originalSend.apply(this, args as any);
};

export {};
