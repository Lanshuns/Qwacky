type BrowserType = typeof chrome

interface MenuCapableBrowser extends BrowserType {
  menus?: unknown
}

declare const browser: MenuCapableBrowser

const api: MenuCapableBrowser = typeof browser !== 'undefined' ? browser : chrome as MenuCapableBrowser

const manifest = api.runtime.getManifest() as { optional_permissions?: string[] }
const contextMenusIsOptional = (manifest.optional_permissions ?? []).includes('contextMenus')

export const contextMenusUnsupportedOnPlatform =
  !contextMenusIsOptional &&
  typeof api.contextMenus === 'undefined' &&
  typeof api.menus === 'undefined'
