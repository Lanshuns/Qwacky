import { useApp } from './context/AppContext'
import styled, { ThemeProvider } from 'styled-components'
import { Login } from './pages/Login'
import { OTP } from './pages/OTP'
import { Dashboard } from './pages/Dashboard'
import { Settings } from './pages/Settings'
import { Changelog } from './pages/Changelog'
import { Header } from './components/Header'
import { theme } from './theme'
import { useState, useEffect } from 'react'

const APP_VERSION = '1.2.1'

const Container = styled.div`
  width: 360px;
  min-height: 480px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  position: relative;
`

export const App = () => {
  const { darkMode, userData } = useApp()
  const [currentPage, setCurrentPage] = useState('login')
  const [tempUsername, setTempUsername] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  const [addingAccount, setAddingAccount] = useState(false)

  useEffect(() => {
    chrome.storage.local.get([
      'loginState',
      'tempUsername',
      'addingAccount',
      'lastVersion',
      'showSettings'
    ], (result) => {
      if (result.loginState) {
        setCurrentPage(result.loginState)
      }
      if (result.tempUsername) {
        setTempUsername(result.tempUsername)
      }
      if (result.addingAccount) {
        setAddingAccount(true)
      }
      if (result.showSettings !== undefined) {
        setShowSettings(result.showSettings)
      }
      if (userData && result.lastVersion !== APP_VERSION) {
        setShowChangelog(true)
        chrome.storage.local.set({ lastVersion: APP_VERSION })
      }
    })
  }, [userData])

  useEffect(() => {
    if (!userData) {
      setCurrentPage('login')
      setTempUsername('')
      setShowSettings(false)
      setShowChangelog(false)
      setAddingAccount(false)
      chrome.storage.local.remove([
        'loginState',
        'tempUsername',
        'addingAccount',
        'otp_verification_in_progress'
      ])
    }
  }, [userData])

  const updateLoginState = (page: string, username?: string) => {
    const storageData: { loginState: string; tempUsername?: string } = { loginState: page }
    setCurrentPage(page)
    
    if (username) {
      setTempUsername(username)
      storageData.tempUsername = username
    }
    
    chrome.storage.local.set(storageData)
  }

  const resetLoginState = () => {
    setCurrentPage('login')
    setTempUsername('')
    chrome.storage.local.remove(['loginState', 'tempUsername'])
  }

  const toggleSettings = () => {
    const newShowSettings = !showSettings
    setShowSettings(newShowSettings)
    chrome.storage.local.set({ showSettings: newShowSettings })
    if (newShowSettings) {
      setShowChangelog(false)
    }
  }
  
  const toggleChangelog = () => {
    const newShowChangelog = !showChangelog
    setShowChangelog(newShowChangelog)
    if (newShowChangelog) {
      setShowSettings(false)
      chrome.storage.local.set({ showSettings: false })
    }
  }
  
  const handleAddAccount = () => {
    setAddingAccount(true)
    setCurrentPage('login')
    setShowSettings(false)
    setShowChangelog(false)
    chrome.storage.local.set({ showSettings: false, addingAccount: true, loginState: 'login' })
  }
  
  const handleCancelAddAccount = () => {
    setAddingAccount(false)
    setCurrentPage('login')
    setTempUsername('')
    chrome.storage.local.remove([
      'addingAccount', 
      'loginState', 
      'tempUsername', 
      'otp_verification_in_progress',
      'showSettings'
    ])
  }
  
  const renderCurrentPage = () => {
    if (!userData || addingAccount) {
      if (currentPage === 'login') {
        return (
          <Login
            onSubmit={(username) => {
              updateLoginState('otp', username)
              setShowSettings(false)
              setShowChangelog(false)
              chrome.storage.local.set({ showSettings: false })
            }}
            isAddingAccount={addingAccount}
            onBack={addingAccount ? handleCancelAddAccount : undefined}
          />
        )
      }
      if (currentPage === 'otp') {
        return (
          <OTP
            username={tempUsername}
            onBack={() => {
              resetLoginState()
              if (addingAccount && userData) {
                handleCancelAddAccount()
              }
              setShowSettings(false)
              setShowChangelog(false)
              chrome.storage.local.set({ showSettings: false })
            }}
            isAddingAccount={addingAccount}
            onSuccess={() => {
              if (addingAccount) {
                handleCancelAddAccount()
              }
              setShowSettings(false)
              setShowChangelog(false)
              chrome.storage.local.set({ showSettings: false })
            }}
          />
        )
      }
    }

    if (userData && !addingAccount) {
      if (showSettings) return <Settings onBack={toggleSettings} />
      if (showChangelog) return <Changelog onBack={toggleChangelog} />
      return <Dashboard />
    }

    return null
  }

  return (
    <ThemeProvider theme={darkMode ? theme.dark : theme.light}>
      <Container>
        <Header 
          onSettingsClick={toggleSettings} 
          onAddAccountClick={handleAddAccount}
          onChangelogClick={toggleChangelog}
        />
        {renderCurrentPage()}
      </Container>
    </ThemeProvider>
  )
}