import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { TranslationKey } from '../i18n/core'

interface ExtendedPermissionEvent extends chrome.events.Event<() => void> {
  addListener: (callback: () => void) => void;
  removeListener: (callback: () => void) => void;
}

interface ExtendedPermissions {
  contains(permissionQuery: {permissions?: string[]}): Promise<boolean>;
  request(permissionQuery: {permissions?: string[]}): Promise<boolean>;
  remove(permissionQuery: {permissions?: string[]}): Promise<boolean>;
  onAdded: ExtendedPermissionEvent;
  onRemoved: ExtendedPermissionEvent;
}

interface ExtendedBrowser extends Omit<typeof chrome, 'permissions'> {
  permissions: ExtendedPermissions;
}

declare const browser: ExtendedBrowser
const api = typeof browser !== 'undefined' ? browser : chrome as unknown as ExtendedBrowser

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')

type PermissionType = 'storage' | 'contextMenuFeatures' | 'contextMenu'

interface Permission {
  /** Stable identifier — never shown to the user. */
  id: PermissionType
  nameKey: TranslationKey
  descriptionKey: TranslationKey
  isRequired: boolean
  permissions: string[]
  browserSpecificInfoKey?: {
    firefox?: TranslationKey
    chrome?: TranslationKey
  }
}

export const PERMISSIONS: Record<PermissionType, Permission> = {
  storage: {
    id: 'storage',
    nameKey: 'permission.storage.name',
    descriptionKey: 'permission.storage.description',
    isRequired: true,
    permissions: ['storage']
  },
  contextMenu: {
    id: 'contextMenu',
    nameKey: 'permission.contextMenu.name',
    descriptionKey: 'permission.contextMenu.description',
    isRequired: true,
    permissions: ['contextMenus']
  },
  contextMenuFeatures: {
    id: 'contextMenuFeatures',
    nameKey: 'permission.autofill.name',
    descriptionKey: isFirefox
      ? 'permission.autofill.descriptionFirefox'
      : 'permission.autofill.descriptionChrome',
    isRequired: false,
    permissions: [
      'activeTab',
      'clipboardWrite',
      'scripting'
    ]
  }
}
interface PermissionContextType {
  checkPermission: (permission: PermissionType) => Promise<boolean>
  requestPermissions: (type: PermissionType) => Promise<boolean>
  removePermissions: (type: PermissionType) => Promise<boolean>
  hasPermissions: Record<PermissionType, boolean>
  isLoading: boolean
}

const PermissionContext = createContext<PermissionContextType>({
  checkPermission: async () => false,
  requestPermissions: async () => false,
  removePermissions: async () => false,
  hasPermissions: {
    storage: false,
    contextMenu: isFirefox,
    contextMenuFeatures: false
  },
  isLoading: true
})

export const usePermissions = () => useContext(PermissionContext)

interface PermissionProviderProps {
  children: React.ReactNode
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const [hasPermissions, setHasPermissions] = useState<Record<PermissionType, boolean>>({
    storage: false,
    contextMenu: isFirefox,
    contextMenuFeatures: false
  })
  const [isLoading, setIsLoading] = useState(true)

  const checkFeaturePermissions = useCallback(async (type: PermissionType): Promise<boolean> => {
    try {
      const permission = PERMISSIONS[type]
      if (!permission) return false

      if (type === 'contextMenu' && isFirefox) {
        return true
      }

      const results = await Promise.all(
        permission.permissions.map(p => api.permissions.contains({ permissions: [p] }))
      )

      if (type === 'contextMenuFeatures' && !isFirefox) {
        const contextMenuResult = await api.permissions.contains({ permissions: ['contextMenus'] })
        return results.every(Boolean) && contextMenuResult
      }

      return results.every(Boolean)
    } catch (error) {
      console.error('Error checking permissions:', error)
      return false
    }
  }, [])

  const checkAllPermissions = useCallback(async () => {
    try {
      const [storagePermission, featureState] = await Promise.all([
        checkFeaturePermissions('storage'),
        api.runtime.sendMessage({ action: 'getFeatureState' })
      ])

      const contextMenuPermissions = await checkFeaturePermissions('contextMenuFeatures')

      setHasPermissions({
        storage: storagePermission,
        contextMenu: isFirefox,
        contextMenuFeatures: featureState?.enabled && contextMenuPermissions
      })
    } catch (error) {
      console.error('Error checking all permissions:', error)
      setHasPermissions({
        storage: false,
        contextMenu: isFirefox,
        contextMenuFeatures: false
      })
    } finally {
      setIsLoading(false)
    }
  }, [checkFeaturePermissions])

  useEffect(() => {
    checkAllPermissions()

    const handlePermissionChange = () => {
      checkAllPermissions()
    }

    api.permissions.onAdded.addListener(handlePermissionChange)
    api.permissions.onRemoved.addListener(handlePermissionChange)

    return () => {
      api.permissions.onAdded.removeListener(handlePermissionChange)
      api.permissions.onRemoved.removeListener(handlePermissionChange)
    }
  }, [checkAllPermissions])

  const checkPermission = useCallback(async (type: PermissionType): Promise<boolean> => {
    const result = await checkFeaturePermissions(type)
    return result
  }, [checkFeaturePermissions])

  const requestPermissions = useCallback(async (type: PermissionType): Promise<boolean> => {
    try {
      const permission = PERMISSIONS[type]
      if (!permission) return false

      if (type === 'contextMenu' && isFirefox) {
        return true
      }

      let permissions = [...permission.permissions]

      if (type === 'contextMenuFeatures' && !isFirefox) {
        permissions.push('contextMenus')
      }

      const result = await api.permissions.request({
        permissions
      })

      if (result) {
        await checkAllPermissions()
      }

      return result
    } catch (error) {
      console.error('Error requesting permissions:', error)
      await checkAllPermissions()
      return false
    }
  }, [checkAllPermissions])

  const removePermissions = useCallback(async (type: PermissionType): Promise<boolean> => {
    try {
      const permission = PERMISSIONS[type]
      if (!permission) return false

      if (permission.isRequired) {
        return false
      }

      let permissions = [...permission.permissions]

      if (type === 'contextMenuFeatures' && !isFirefox) {
        permissions.push('contextMenus')
      }

      const result = await api.permissions.remove({
        permissions
      })

      if (result) {
        await checkAllPermissions()
      }

      return result
    } catch (error) {
      console.error('Error removing permissions:', error)
      await checkAllPermissions()
      return false
    }
  }, [checkAllPermissions])

  const value: PermissionContextType = {
    checkPermission,
    requestPermissions,
    removePermissions,
    hasPermissions,
    isLoading
  }

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
}

export const ALL_PERMISSIONS = Object.keys(PERMISSIONS).filter(key => {
  if (key === 'contextMenu' && !isFirefox) {
    return false;
  }
  return true;
}) as PermissionType[]