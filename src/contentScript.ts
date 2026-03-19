type BrowserType = typeof chrome;
declare const browser: BrowserType;
const api: BrowserType = typeof browser !== 'undefined' ? browser : chrome;

const setupConnection = () => {
  try {
    api.runtime.connect();
    return true;
  } catch {
    window.location.reload();
    return false;
  }
}

const showNotification = (message: string) => {
  const notification = document.createElement('div')
  const styles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#ff9f19',
    color: 'white',
    padding: '16px 24px',
    borderRadius: '8px',
    zIndex: '999999',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
  }
  Object.assign(notification.style, styles)
  notification.setAttribute('role', 'status')
  notification.setAttribute('aria-live', 'polite')
  notification.textContent = message === 'Not authenticated' ? 'You need to login first' : message
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.remove()
  }, 3000)
}

const fillInput = (element: HTMLElement | null, value: string) => {
  if (!element) return false

  const fullAddress = `${value}@duck.com`

  try {
    if (element.isContentEditable) {
      element.textContent = fullAddress
      return true
    }

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      element.value = fullAddress

      element.dispatchEvent(new Event('input', { bubbles: true }))
      element.dispatchEvent(new Event('change', { bubbles: true }))
      
      return true
    }
  } catch {
    return false
  }

  return false
}

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

api.runtime.onMessage.addListener(async (message, _sender) => {
  if (!setupConnection()) return;

  if (message.type === 'fill-address') {
    const activeElement = document.activeElement as HTMLElement | null
    const filled = fillInput(activeElement, message.address)

    const copied = await copyToClipboard(`${message.address}@duck.com`);
    
    if (!filled) {
      showNotification(copied 
        ? 'Could not fill input, address copied to clipboard' 
        : 'Could not fill input or copy to clipboard. Please check permissions in settings.');
    } else {
      showNotification(copied 
        ? 'Address filled and copied to clipboard' 
        : 'Address filled but could not copy to clipboard. Please check permissions in settings.');
    }
  }

  if (message.type === 'show-notification') {
    showNotification(message.message)
  }
})

export {}