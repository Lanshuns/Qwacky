type BrowserType = typeof chrome;

interface FirefoxBrowserType extends BrowserType {
  menus?: {
    removeAll: () => Promise<void>;
    create: (options: chrome.contextMenus.CreateProperties) => Promise<void>;
    onClicked: {
      addListener: (callback: (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => void) => void;
    };
  };
}

declare let browser: FirefoxBrowserType;
const api: FirefoxBrowserType = typeof browser !== 'undefined' ? browser : chrome as FirefoxBrowserType;

import { DuckService } from './services/DuckService'
import { SyncService } from './services/SyncService'

const duckService = new DuckService()
const syncService = new SyncService()

const FEATURE_STATE_KEY = 'contextMenuEnabled'
const CONTEXT_MENU_ID = 'generate-duck-address'
const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')

const FeatureState = {
  async get(): Promise<boolean> {
    const result = await api.storage.local.get(FEATURE_STATE_KEY)
    return Boolean(result[FEATURE_STATE_KEY])
  },

  async set(enabled: boolean): Promise<void> {
    await api.storage.local.set({ [FEATURE_STATE_KEY]: enabled })
  }
}

const Permissions = {
  async check(): Promise<boolean> {    
    const requiredPermissions = ['activeTab', 'clipboardWrite', 'scripting']
    
    try {
      const results = await Promise.all(
        requiredPermissions.map(p => api.permissions.contains({ permissions: [p] }))
      )

      if (!isFirefox) {
        const contextMenuResult = await api.permissions.contains({ permissions: ['contextMenus'] })
        return results.every(Boolean) && contextMenuResult
      }

      return results.every(Boolean)
    } catch (error) {
      console.error('Error checking permissions:', error)
      return false
    }
  }
}

const ContextMenu = {
  menuExists: false,

  async ensureRemoved(): Promise<void> {
    if (!api.contextMenus) return;

    return new Promise<void>((resolve) => {
      if (this.menuExists) {
        api.contextMenus.removeAll(() => {
          void chrome.runtime.lastError;
          this.menuExists = false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  },

  async create(): Promise<boolean> {
    if (!api.contextMenus) {
      console.error('Context menu API not available');
      return false;
    }

    try {
      await this.ensureRemoved();

      return new Promise<boolean>((resolve) => {
        api.contextMenus.create({
          id: CONTEXT_MENU_ID,
          title: 'Autofill Duck Address',
          contexts: ['editable']
        }, () => {
          const error = chrome.runtime.lastError;
          if (error?.message?.includes('already exists')) {
            this.menuExists = true;
            resolve(true);
            return;
          }
          if (error) {
            resolve(false);
            return;
          }
          this.menuExists = true;
          resolve(true);
        });
      });
    } catch (error) {
      return false;
    }
  },

  async remove(): Promise<boolean> {
    try {
      await this.ensureRemoved();
      return true;
    } catch (error) {
      console.error('Menu removal error:', error);
      return false;
    }
  }
}

const Feature = {
  async enable(): Promise<boolean> {
    try {
      const hasPermissions = await Permissions.check()
      
      if (!hasPermissions) {
        console.error('Missing required permissions')
        return false
      }

      await FeatureState.set(true)
      const menuCreated = await ContextMenu.create()
      
      if (!menuCreated) {
        console.error('Failed to create context menu')
        await FeatureState.set(false)
      }
      
      return menuCreated
    } catch (error) {
      console.error('Error enabling feature:', error)
      await FeatureState.set(false)
      return false
    }
  },

  async disable(): Promise<boolean> {
    try {
      const removed = await ContextMenu.remove()
      await FeatureState.set(false)
      return removed
    } catch (error) {
      console.error('Error disabling feature:', error)
      return false
    }
  },

  async toggle(enabled: boolean): Promise<boolean> {
    return enabled ? this.enable() : this.disable()
  }
}

const initialize = async () => {  
  try {
    const [hasState, hasPermissions] = await Promise.all([
      api.storage.local.get(FEATURE_STATE_KEY),
      Permissions.check()
    ])

    if (hasState[FEATURE_STATE_KEY] === undefined) {
      await FeatureState.set(false)
    }

    const shouldBeEnabled = hasState[FEATURE_STATE_KEY] && hasPermissions
    if (shouldBeEnabled) {
      await ContextMenu.create()
    } else {
      await ContextMenu.remove()
      if (hasState[FEATURE_STATE_KEY] && !hasPermissions) {
        await FeatureState.set(false)
      }
    }
  } catch (error) {
    console.error('Error during initialization:', error)
    await Feature.disable()
  }
}

api.runtime.onInstalled.addListener(() => {
  setTimeout(initialize, 1000)
})

setTimeout(initialize, 1000)

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'getFeatureState') {
    FeatureState.get()
      .then(enabled => sendResponse({ enabled }))
      .catch(() => sendResponse({ enabled: false }))
    return true
  }
  
  if (message.action === 'toggleFeature') {
    Feature.toggle(message.enabled)
      .then(success => sendResponse({ success }))
      .catch(() => sendResponse({ success: false }))
    return true
  }
  
  if (message.action === 'reload-extension') {
    try {
      setTimeout(() => api.runtime.reload(), 500)
      sendResponse({ success: true })
    } catch (error) {
      sendResponse({ success: false, error: String(error) })
    }
    return true
  }

  if (message.action === 'requestOTP') {
    duckService.login(message.username)
      .then(sendResponse)
      .catch(err => sendResponse({ status: 'error', message: err.message || 'Unknown error' }))
    return true
  }
  
  if (message.action === 'verifyOTP') {
    duckService.verifyOTP(message.username, message.otp)
      .then(sendResponse)
      .catch(err => sendResponse({ status: 'error', message: err.message || 'Unknown error' }))
    return true
  }
  
  if (message.action === 'generateAddress') {
    duckService.generateAddress(message.domain)
      .then(sendResponse)
      .catch(err => sendResponse({ status: 'error', message: err.message || 'Unknown error' }))
    return true
  }

  return false
})

if (api.contextMenus) {
  api.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== CONTEXT_MENU_ID || !tab?.id || tab.id < 0) return

    try {
      let domain = ''
      if (tab.url) {
        try {
          domain = new URL(tab.url).hostname
        } catch {}
      }

      const response = await duckService.generateAddress(domain || undefined)
      if (response.status === 'error') {
        await api.tabs.sendMessage(tab.id, {
          type: 'show-notification',
          message: response.message || 'Failed to generate address. Login required?'
        })
        return
      }

      await api.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['contentScript.js']
      })

      await api.tabs.sendMessage(tab.id, {
        type: 'fill-address',
        address: response.address
      })
    } catch (error) {
      console.error('Error in context menu handler:', error)
    }
  })
}

if (api.commands) {
  api.commands.onCommand.addListener(async (command) => {
    console.log('Command received:', command)
    if (command !== 'generate-duck-address') return

    try {
      console.log('Processing generate-duck-address command')
      const [activeTab] = await api.tabs.query({ active: true, currentWindow: true })
      console.log('Active tab:', activeTab)
      if (!activeTab?.id || activeTab.id < 0) return

      let domain = ''
      if (activeTab.url) {
        try {
          domain = new URL(activeTab.url).hostname
        } catch {}
      }
      console.log('Domain:', domain)

      const response = await duckService.generateAddress(domain || undefined)
      console.log('Generate response:', response)
      if (response.status === 'error') {
        await api.tabs.sendMessage(activeTab.id, {
          type: 'show-notification',
          message: response.message || 'Failed to generate address. Login required?'
        })
        return
      }

      await api.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ['contentScript.js']
      })

      await api.tabs.sendMessage(activeTab.id, {
        type: 'fill-address',
        address: response.address
      })
    } catch (error) {
      console.error('Error in command handler:', error)
    }
  })
} else {
  console.log('Commands API not available')
}

api.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'sync') {
    for (const key in changes) {
      if (key.startsWith('addresses_')) {
        try {
          await syncService.handleSyncChange(key, changes[key].newValue || []);
        } catch (error) {
          console.error('Error handling sync change:', error);
        }
      }
    }
  }
});
