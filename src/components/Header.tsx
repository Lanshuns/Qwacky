import { useState, useRef, useEffect } from 'react'
import { MdLightMode, MdDarkMode, MdLogout, MdSettings, MdDevices, MdMenu, MdAccountCircle, MdPersonAdd, MdNewReleases, MdSwapHoriz, MdKeyboardArrowDown, MdEdit, MdCheck, MdClose, MdFavorite, MdInfoOutline } from 'react-icons/md'
import { useApp, ThemeMode } from '../context/AppContext'
import { ConfirmDialog } from './ConfirmDialog'
import {
  HeaderContainer,
  TitleSection,
  Title,
  Logo,
  IconsSection,
  IconButton,
  ThemeDropdown,
  MenuDropdown,
  DropdownContent,
  SubDropdown,
  AccountsMenuWrapper,
  DropdownItem,
  DropdownDivider,
  AccountItem,
  CurrentAccountItem,
  NicknameEditDialog,
  NicknameDialogContent,
  NicknameDialogTitle,
  NicknameDialogSubtitle,
  NicknameInput,
  NicknameDialogActions,
  NicknameButton
} from '../styles/Header.styles'

interface HeaderProps {
  onSettingsClick?: () => void;
  onAddAccountClick?: () => void;
  onChangelogClick?: () => void;
  onAboutClick?: () => void;
}

export const Header = ({ onSettingsClick, onAddAccountClick, onChangelogClick, onAboutClick }: HeaderProps) => {
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

  const openReviews = () => window.open('https://chromewebstore.google.com/detail/qwacky/kieehbhdbincplacegpjdkoglfakboeo/reviews', '_blank')
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
          <IconButton onClick={openReviews}>
            <MdFavorite size={24} />
          </IconButton>
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
          <MenuDropdown ref={menuDropdownRef}>
            <IconButton onClick={() => setMenuDropdownOpen(!menuDropdownOpen)}>
              <MdMenu size={24} />
            </IconButton>
            <DropdownContent isOpen={menuDropdownOpen}>
              {userData && (
                <>
                  <CurrentAccountItem>
                    <MdAccountCircle size={20} />
                    <span className="username">{currentAccount ? getDisplayName(currentAccount) : ''}</span>
                    <MdEdit
                      size={22}
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
                            transition: 'transform 0.15s'
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
                </>
              )}
              <DropdownItem onClick={() => handleMenuItemClick(onSettingsClick)}>
                <MdSettings size={20} />
                Settings
              </DropdownItem>
              <DropdownItem onClick={() => handleMenuItemClick(onChangelogClick)}>
                <MdNewReleases size={20} />
                What's new?
              </DropdownItem>
              <DropdownItem onClick={() => handleMenuItemClick(onAboutClick)}>
                <MdInfoOutline size={20} />
                About
              </DropdownItem>
              {userData && (
                <>
                  <DropdownDivider />
                  <DropdownItem onClick={handleLogoutClick} logout>
                    <MdLogout size={20} />
                    Log out
                  </DropdownItem>
                </>
              )}
            </DropdownContent>
          </MenuDropdown>
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
