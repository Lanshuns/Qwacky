import React, { createContext, useContext, useState, useEffect } from 'react'
import { DuckService } from '../services/DuckService'
import { UserData } from '../types'

export type ThemeMode = 'light' | 'dark' | 'system';

interface Account {
  userData: UserData;
  username: string;
  lastUsed: number;
}

interface AppContextType {
  themeMode: ThemeMode;
  darkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleDarkMode: () => void;
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  logout: () => Promise<void>;
  accounts: Account[];
  currentAccount: string | null;
  switchAccount: (username: string) => Promise<void>;
  removeAccount: (username: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined)
const duckService = new DuckService()

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode')
    return saved ? JSON.parse(saved) : 'system'
  })
  
  const [systemIsDark, setSystemIsDark] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  
  const [userData, setUserData] = useState<UserData | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [currentAccount, setCurrentAccount] = useState<string | null>(null)

  const darkMode = themeMode === 'dark' || (themeMode === 'system' && systemIsDark)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    localStorage.setItem('themeMode', JSON.stringify(themeMode))
  }, [themeMode])

  useEffect(() => {
    const loadAccounts = async () => {
      const result = await chrome.storage.local.get(['accounts', 'currentAccount'])
      if (result.accounts) {
        setAccounts(result.accounts)
      }
      if (result.currentAccount) {
        setCurrentAccount(result.currentAccount)
        const account = result.accounts.find((acc: Account) => acc.username === result.currentAccount)
        if (account) {
          setUserData(account.userData)
        }
      } else {
        duckService.getUserData().then(data => {
          if (data) {
            setUserData(data)
            if (data.user && data.user.username) {
              const newAccount: Account = {
                userData: data,
                username: data.user.username,
                lastUsed: Date.now()
              }
              setAccounts([newAccount])
              setCurrentAccount(data.user.username)
              chrome.storage.local.set({
                accounts: [newAccount],
                currentAccount: data.user.username
              })
            }
          }
        })
      }
    }
    
    loadAccounts()
  }, [])

  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes.user_data) {
        const newUserData = changes.user_data.newValue;
        if (newUserData && currentAccount === newUserData.user?.username) {
          setUserData(newUserData);
        }
      }
      
      if (areaName === 'local' && changes.accounts) {
        const newAccounts = changes.accounts.newValue;
        if (newAccounts) {
          setAccounts(newAccounts);
          if (currentAccount) {
            const account = newAccounts.find((acc: Account) => acc.username === currentAccount);
            if (account) {
              setUserData(account.userData);
            }
          }
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [currentAccount]);

  const toggleDarkMode = () => {
    if (themeMode === 'system') {
      setThemeMode(systemIsDark ? 'light' : 'dark')
    } else {
      setThemeMode(themeMode === 'dark' ? 'light' : 'dark')
    }
  }

  const logout = async () => {
    if (currentAccount) {
      const updatedAccounts = accounts.filter(acc => acc.username !== currentAccount)
      await chrome.storage.local.set({ accounts: updatedAccounts })
      
      if (updatedAccounts.length > 0) {
        updatedAccounts.sort((a, b) => b.lastUsed - a.lastUsed)
        const newCurrentAccount = updatedAccounts[0]
        await chrome.storage.local.set({ 
          currentAccount: newCurrentAccount.username,
          user_data: newCurrentAccount.userData,
          access_token: newCurrentAccount.userData.user.access_token,
          loginState: 'login'
        })
        setCurrentAccount(newCurrentAccount.username)
        setUserData(newCurrentAccount.userData)
        setAccounts(updatedAccounts)
      } else {
        await chrome.storage.local.remove([
          'currentAccount', 
          'user_data', 
          'access_token',
          'otp_verification_in_progress',
          'addingAccount',
          'tempUsername'
        ])
        await chrome.storage.local.set({ loginState: 'login' })
        setCurrentAccount(null)
        setUserData(null)
        setAccounts([])
      }
    } else {
      await duckService.logout()
      await chrome.storage.local.remove([
        'currentAccount', 
        'user_data', 
        'access_token',
        'otp_verification_in_progress',
        'addingAccount',
        'tempUsername'
      ])
      await chrome.storage.local.set({ loginState: 'login' })
      setUserData(null)
    }
  }

  const switchAccount = async (username: string) => {
    const account = accounts.find(acc => acc.username === username)
    if (account) {
      const result = await chrome.storage.local.get(['user_data'])
      const latestUserData = result.user_data
      
      const updatedUserData = latestUserData && latestUserData.user && 
                             latestUserData.user.username === username ? 
                             latestUserData : account.userData
      
      const updatedAccount = { 
        ...account, 
        lastUsed: Date.now(),
        userData: updatedUserData
      }
      const updatedAccounts = accounts.map(acc => 
        acc.username === username ? updatedAccount : acc
      )

      setCurrentAccount(username)
      setUserData(updatedAccount.userData)
      setAccounts(updatedAccounts)

      await chrome.storage.local.set({
        currentAccount: username,
        accounts: updatedAccounts,
        user_data: updatedAccount.userData,
        access_token: updatedAccount.userData.user.access_token
      })
    } else {
      const result = await chrome.storage.local.get(['accounts', 'user_data', 'access_token'])
      if (result.accounts) {
        const freshAccount = result.accounts.find((acc: Account) => acc.username === username)
        if (freshAccount) {
          setAccounts(result.accounts)
          setCurrentAccount(username)
          setUserData(freshAccount.userData)
          await chrome.storage.local.set({
            currentAccount: username,
            user_data: freshAccount.userData,
            access_token: freshAccount.userData.user.access_token
          })
        } else if (result.user_data && result.access_token) {
          const newAccount: Account = {
            userData: result.user_data,
            username: username,
            lastUsed: Date.now()
          }
          
          const updatedAccounts = [...accounts, newAccount]
          setAccounts(updatedAccounts)
          setCurrentAccount(username)
          setUserData(newAccount.userData)
          
          await chrome.storage.local.set({
            currentAccount: username,
            accounts: updatedAccounts,
          })
        }
      }
    }
  }

  const removeAccount = async (username: string) => {
    if (username === currentAccount) {
      return
    }
    
    const updatedAccounts = accounts.filter(acc => acc.username !== username)
    setAccounts(updatedAccounts)
    await chrome.storage.local.set({ accounts: updatedAccounts })
  }

  return (
    <AppContext.Provider value={{ 
      themeMode, 
      darkMode, 
      setThemeMode, 
      toggleDarkMode, 
      userData, 
      setUserData, 
      logout,
      accounts,
      currentAccount,
      switchAccount,
      removeAccount
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}