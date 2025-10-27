import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { MdLightMode, MdDarkMode, MdLogout, MdSettings, MdDevices, MdMenu, MdAccountCircle, MdPersonAdd, MdUpdate, MdSwapHoriz, MdKeyboardArrowDown, MdEdit, MdCheck, MdClose } from 'react-icons/md'
import { FaGithub } from 'react-icons/fa'
import { useApp, ThemeMode } from '../context/AppContext'
import { ConfirmDialog } from './ConfirmDialog'

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.border};
`

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
`

const Title = styled.h1`
  font-size: 24px;
  color: ${props => props.theme.primary};
  margin: 0;
`

const Logo = styled.img`
  width: 32px;
  height: 32px;
`

const IconsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.primary};
  cursor: pointer;
  padding: 4px;
  
  &.logout {
    color: ${props => props.theme.error};
  }
`

const BaseDropdown = styled.div`
  position: relative;
  display: inline-block;
`

const ThemeDropdown = styled(BaseDropdown)``
const MenuDropdown = styled(BaseDropdown)``

const DropdownContent = styled.div<{ isOpen: boolean }>`
  display: ${props => (props.isOpen ? 'block' : 'none')};
  position: absolute;
  right: 0;
  background-color: ${props => props.theme.background};
  min-width: 200px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.border};
`

const SubDropdown = styled.div`
  padding-left: 16px;
  background-color: ${props => props.theme.surface};
  border-left: 2px solid ${props => props.theme.border};
  margin: 4px 0;
  display: none;
`

const AccountsMenuWrapper = styled.div<{ isOpen?: boolean }>`
  ${SubDropdown} {
    display: ${props => props.isOpen ? 'block' : 'none'};
  }
`

const DropdownItem = styled.div<{ active?: boolean; current?: boolean; logout?: boolean }>`
  color: ${props => {
    if (props.logout) return props.theme.error;
    if (props.current) return props.theme.primary;
    return props.active ? props.theme.primary : props.theme.text;
  }};
  padding: 12px 16px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme.hover};
  }
  
  svg {
    color: ${props => {
      if (props.logout) return props.theme.error;
      return props.theme.primary;
    }};
  }
`

const DropdownDivider = styled.div`
  height: 1px;
  background-color: ${props => props.theme.border};
  margin: 4px 0;
`

const AccountItem = styled(DropdownItem)`
  padding: 8px 16px;
  font-size: 14px;
  
  &.current {
    color: ${props => props.theme.primary};
    font-weight: 500;
    
    svg {
      color: ${props => props.theme.primary};
    }
  }
  
  .username {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const CurrentAccountItem = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.primary};
  
  svg {
    color: ${props => props.theme.primary};
  }
  
  .username {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .edit-icon {
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    
    &:hover {
      background-color: ${props => props.theme.hover};
    }
  }
`

const NicknameEditDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const NicknameDialogContent = styled.div`
  background: ${props => props.theme.surface};
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`

const NicknameDialogTitle = styled.h3`
  margin: 0 0 8px 0;
  color: ${props => props.theme.text};
  font-size: 18px;
`

const NicknameDialogSubtitle = styled.div`
  color: ${props => props.theme.textSecondary};
  font-size: 13px;
  margin-bottom: 16px;
`

const NicknameInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid ${props => props.theme.border};
  border-radius: 8px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 14px;
  margin-bottom: 16px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }

  &::placeholder {
    color: ${props => props.theme.textTertiary};
  }
`

const NicknameDialogActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`

const NicknameButton = styled.button<{ primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  ${props => props.primary ? `
    background: ${props.theme.primary};
    color: white;
    
    &:hover {
      opacity: 0.9;
    }
  ` : `
    background: ${props.theme.surface};
    color: ${props.theme.text};
    border: 1px solid ${props.theme.border};
    
    &:hover {
      background: ${props.theme.hover};
    }
  `}
`

interface HeaderProps {
  onSettingsClick?: () => void;
  onAddAccountClick?: () => void;
  onChangelogClick?: () => void;
}

export const Header = ({ onSettingsClick, onAddAccountClick, onChangelogClick }: HeaderProps) => {
  const { darkMode, themeMode, setThemeMode, userData, logout, accounts, currentAccount, switchAccount } = useApp()
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false)
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [accountsListOpen, setAccountsListOpen] = useState(false)
  const [showNicknameDialog, setShowNicknameDialog] = useState(false)
  const [nickname, setNickname] = useState('')
  const [accountNicknames, setAccountNicknames] = useState<Record<string, string>>({})
  const themeDropdownRef = useRef<HTMLDivElement>(null)
  const menuDropdownRef = useRef<HTMLDivElement>(null)
  
  const openGitHub = () => window.open('https://github.com/Lanshuns/Qwacky', '_blank')
  const openStore = () => window.open('https://chromewebstore.google.com/detail/qwacky/kieehbhdbincplacegpjdkoglfakboeo', '_blank')
  
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
    setMenuDropdownOpen(false)
  }
  
  const handleLogoutConfirm = async () => {
    await logout()
    setShowLogoutConfirm(false)
  }
  
  const handleSwitchAccount = (username: string) => {
    switchAccount(username)
    setMenuDropdownOpen(false)
  }
  
  const handleMenuItemClick = (handler?: () => void) => {
    if (handler) {
      handler()
      setMenuDropdownOpen(false)
    }
  }

  const handleEditNickname = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentAccount) {
      setNickname(accountNicknames[currentAccount] || '')
      setShowNicknameDialog(true)
      setMenuDropdownOpen(false)
    }
  }

  const handleSaveNickname = async () => {
    if (currentAccount) {
      const updatedNicknames = { ...accountNicknames, [currentAccount]: nickname.trim() }
      setAccountNicknames(updatedNicknames)
      await chrome.storage.local.set({ accountNicknames: updatedNicknames })
      setShowNicknameDialog(false)
    }
  }

  const handleClearNickname = async () => {
    if (currentAccount) {
      const updatedNicknames = { ...accountNicknames }
      delete updatedNicknames[currentAccount]
      setAccountNicknames(updatedNicknames)
      await chrome.storage.local.set({ accountNicknames: updatedNicknames })
      setShowNicknameDialog(false)
      setNickname('')
    }
  }

  const getDisplayName = (username: string) => {
    return accountNicknames[username] || username
  }
  
  useEffect(() => {
    const loadNicknames = async () => {
      const result = await chrome.storage.local.get('accountNicknames')
      if (result.accountNicknames) {
        setAccountNicknames(result.accountNicknames)
      }
    }
    loadNicknames()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false)
      }
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target as Node)) {
        setMenuDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
      <HeaderContainer>
        <TitleSection onClick={openStore}>
          <Logo src="/assets/icons/qwacky.png" alt="Qwacky" />
          <Title>Qwacky</Title>
        </TitleSection>
        <IconsSection>
          <ThemeDropdown ref={themeDropdownRef}>
            <IconButton onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}>
              {darkMode ? <MdDarkMode size={24} /> : <MdLightMode size={24} />}
            </IconButton>
            <DropdownContent isOpen={themeDropdownOpen}>
              {[
                { mode: 'light' as const, icon: MdLightMode, label: 'Light' },
                { mode: 'dark' as const, icon: MdDarkMode, label: 'Dark' },
                { mode: 'system' as const, icon: MdDevices, label: 'System' }
              ].map(({ mode, icon: Icon, label }) => (
                <DropdownItem
                  key={mode}
                  active={themeMode === mode}
                  onClick={() => {
                    setThemeMode(mode as ThemeMode)
                    setThemeDropdownOpen(false);
                  }}
                >
                  <Icon size={20} /> {label}
                </DropdownItem>
              ))}
            </DropdownContent>
          </ThemeDropdown>
          <IconButton className="github" onClick={openGitHub}>
            <FaGithub size={24} />
          </IconButton>
          {userData && (
            <MenuDropdown ref={menuDropdownRef}>
              <IconButton className="menu" onClick={() => setMenuDropdownOpen(!menuDropdownOpen)}>
                <MdMenu size={24} />
              </IconButton>
              <DropdownContent isOpen={menuDropdownOpen}>
                <CurrentAccountItem>
                  <MdAccountCircle size={20} />
                  <span className="username">{currentAccount ? getDisplayName(currentAccount) : ''}</span>
                  <MdEdit 
                    size={18} 
                    className="edit-icon"
                    onClick={handleEditNickname}
                  />
                </CurrentAccountItem>
                
                <DropdownDivider />
                {accounts.length > 1 && (
                  <AccountsMenuWrapper isOpen={accountsListOpen}>
                    <DropdownItem onClick={() => setAccountsListOpen(!accountsListOpen)}>
                      <MdSwapHoriz size={20} />
                      Switch Account
                      <MdKeyboardArrowDown
                        size={20}
                        style={{
                          marginLeft: 'auto',
                          transform: accountsListOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </DropdownItem>
                    <SubDropdown>
                      {accounts
                        .filter(account => account.username !== currentAccount)
                        .map(account => (
                          <AccountItem 
                            key={account.username}
                            onClick={() => handleSwitchAccount(account.username)}
                          >
                            <MdAccountCircle size={16} />
                            <span className="username">{getDisplayName(account.username)}</span>
                          </AccountItem>
                        ))
                      }
                    </SubDropdown>
                  </AccountsMenuWrapper>
                )}
                {accountsListOpen && <DropdownDivider />}
                <DropdownItem onClick={() => handleMenuItemClick(onAddAccountClick)}>
                  <MdPersonAdd size={20} />
                  Add Account
                </DropdownItem>
                <DropdownDivider />
                
                <DropdownItem onClick={() => handleMenuItemClick(onSettingsClick)}>
                  <MdSettings size={20} />
                  Settings
                </DropdownItem>
                
                <DropdownItem onClick={() => handleMenuItemClick(onChangelogClick)}>
                  <MdUpdate size={20} />
                  Change log
                </DropdownItem>
                
                <DropdownItem onClick={handleLogoutClick} logout>
                  <MdLogout size={20} />
                  Log out
                </DropdownItem>
              </DropdownContent>
            </MenuDropdown>
          )}
        </IconsSection>
      </HeaderContainer>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {showNicknameDialog && (
        <NicknameEditDialog onClick={() => setShowNicknameDialog(false)}>
          <NicknameDialogContent onClick={(e) => e.stopPropagation()}>
            <NicknameDialogTitle>Edit Account Nickname</NicknameDialogTitle>
            <NicknameDialogSubtitle>
              Set a custom nickname for <strong>{currentAccount}</strong>
            </NicknameDialogSubtitle>
            <NicknameInput
              type="text"
              placeholder="Enter nickname (optional)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveNickname()
                if (e.key === 'Escape') setShowNicknameDialog(false)
              }}
              autoFocus
            />
            <NicknameDialogActions>
              {accountNicknames[currentAccount!] && (
                <NicknameButton onClick={handleClearNickname}>
                  <MdClose size={18} />
                  Clear
                </NicknameButton>
              )}
              <NicknameButton onClick={() => setShowNicknameDialog(false)}>
                Cancel
              </NicknameButton>
              <NicknameButton primary onClick={handleSaveNickname}>
                <MdCheck size={18} />
                Save
              </NicknameButton>
            </NicknameDialogActions>
          </NicknameDialogContent>
        </NicknameEditDialog>
      )}
    </>
  )
}