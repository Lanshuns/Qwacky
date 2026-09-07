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

// Only one notification is on screen at a time, so a result can replace the
// pending spinner instead of stacking underneath it.
let activeNotification: HTMLElement | null = null
let dismissTimer: ReturnType<typeof setTimeout> | null = null

const dismissNotification = () => {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
  activeNotification?.remove()
  activeNotification = null
}

const createSpinner = () => {
  const spinner = document.createElement('span')
  Object.assign(spinner.style, {
    width: '14px',
    height: '14px',
    flex: '0 0 auto',
    borderRadius: '50%',
    boxSizing: 'border-box',
    border: '2px solid rgba(255, 255, 255, 0.35)',
    borderTopColor: '#fff'
  })
  // Animated here rather than with a stylesheet so nothing leaks into the page.
  spinner.animate(
    [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
    { duration: 700, iterations: Infinity }
  )
  return spinner
}

// A pending notification waits for its result, but never hangs around forever
// if the background page dies before sending one.
const PENDING_TIMEOUT_MS = 20000
const DISMISS_TIMEOUT_MS = 3000

const showNotification = (message: string, pending = false) => {
  dismissNotification()

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
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }
  Object.assign(notification.style, styles)
  notification.setAttribute('role', 'status')
  notification.setAttribute('aria-live', 'polite')

  if (pending) {
    notification.appendChild(createSpinner())
  }

  const label = document.createElement('span')
  label.textContent = message === 'Not authenticated' ? 'You need to login first' : message
  notification.appendChild(label)

  document.body.appendChild(notification)
  activeNotification = notification

  dismissTimer = setTimeout(
    dismissNotification,
    pending ? PENDING_TIMEOUT_MS : DISMISS_TIMEOUT_MS
  )
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

const replaceSelection = (value: string, find?: string) => {
  const element = document.activeElement as HTMLElement | null
  if (!element) return false

  try {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      const start = element.selectionStart
      const end = element.selectionEnd
      if (start !== null && end !== null && start !== end) {
        element.setRangeText(value, start, end, 'end')
      } else if (find && element.value.includes(find)) {
        const index = element.value.indexOf(find)
        element.setRangeText(value, index, index + find.length, 'end')
      } else {
        element.value = value
      }
      element.dispatchEvent(new Event('input', { bubbles: true }))
      element.dispatchEvent(new Event('change', { bubbles: true }))
      return true
    }

    if (element.isContentEditable) {
      return document.execCommand('insertText', false, value)
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

if (!(window as unknown as { __qwackyContentScript?: boolean }).__qwackyContentScript) {
  (window as unknown as { __qwackyContentScript?: boolean }).__qwackyContentScript = true

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

    if (message.type === 'replace-selection') {
      const replaced = replaceSelection(message.text, message.find)
      const copied = await copyToClipboard(message.text)

      if (!replaced) {
        showNotification(copied
          ? 'Could not replace selection, address copied to clipboard'
          : 'Could not replace selection or copy to clipboard. Please check permissions in settings.');
      } else {
        showNotification(copied
          ? 'Converted and copied to clipboard'
          : 'Converted, but could not copy to clipboard. Please check permissions in settings.');
      }
    }

    if (message.type === 'show-pending') {
      showNotification(message.message, true)
    }

    if (message.type === 'show-notification') {
      showNotification(message.message)
    }
  })
}

export {}