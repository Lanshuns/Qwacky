import { useApp } from './context/AppContext'
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components'
import { Login } from './pages/Login'
import { OTP } from './pages/OTP'
import { Dashboard } from './pages/Dashboard'
import { Settings } from './pages/Settings'
import { Changelog } from './pages/Changelog'
import { About } from './pages/About'
import { Header } from './components/Header'
import { theme } from './theme'
import { useState, useEffect } from 'react'

const APP_VERSION = '1.2.1'

const GlobalStyle = createGlobalStyle`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background: ${props => props.theme.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::selection {
    background: ${props => props.theme.primary}30;
    color: ${props => props.theme.text};
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.border};
    border-radius: 3px;
    transition: background 0.2s;

    &:hover {
      background: ${props => `${props.theme.primary}80`};
    }
  }
`

const Container = styled.div`
  width: 400px;
  min-height: 480px;
  color: ${props => props.theme.text};
  position: relative;
  margin: auto;
  background: ${props => props.theme.background};
  overflow: hidden;
`

export const App = () => {
  const { darkMode, userData } = useApp()
  const [currentPage, setCurrentPage] = useState('login')
  const [tempUsername, setTempUsername] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
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
      setShowAbout(false)
    }
  }
  
  const toggleChangelog = () => {
    const newShowChangelog = !showChangelog
    setShowChangelog(newShowChangelog)
    if (newShowChangelog) {
      setShowSettings(false)
      setShowAbout(false)
      chrome.storage.local.set({ showSettings: false })
    }
  }

  const toggleAbout = () => {
    const newShowAbout = !showAbout
    setShowAbout(newShowAbout)
    if (newShowAbout) {
      setShowSettings(false)
      setShowChangelog(false)
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
    if (showSettings) return <Settings onBack={toggleSettings} />
    if (showAbout) return <About onBack={toggleAbout} />

    if (!userData || addingAccount) {
      if (currentPage === 'login') {
        return (
          <Login
            onSubmit={(username) => {
              updateLoginState('otp', username)
              setShowSettings(false)
              setShowChangelog(false)
              setShowAbout(false)
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
              setShowAbout(false)
              chrome.storage.local.set({ showSettings: false })
            }}
            isAddingAccount={addingAccount}
            onSuccess={() => {
              if (addingAccount) {
                handleCancelAddAccount()
              }
              setShowSettings(false)
              setShowChangelog(false)
              setShowAbout(false)
              chrome.storage.local.set({ showSettings: false })
            }}
          />
        )
      }
    }

    if (userData && !addingAccount) {
      if (showChangelog) return <Changelog onBack={toggleChangelog} />
      return <Dashboard />
    }

    return null
  }

  return (
    <ThemeProvider theme={darkMode ? theme.dark : theme.light}>
      <GlobalStyle />
      <Container>
        <Header
          onSettingsClick={toggleSettings}
          onAddAccountClick={handleAddAccount}
          onChangelogClick={toggleChangelog}
          onAboutClick={toggleAbout}
        />
        {renderCurrentPage()}
      </Container>
    </ThemeProvider>
  )
}