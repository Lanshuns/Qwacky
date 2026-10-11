import { useState, useRef, useEffect } from 'react'
import { MdLogout, MdSettings, MdMenu, MdPersonAdd, MdNewReleases, MdEdit, MdCheck, MdClose, MdFavorite, MdInfoOutline, MdManageAccounts, MdOpenInNew } from 'react-icons/md'
import { useApp } from '../context/AppContext'
import { ConfirmDialog } from './ConfirmDialog'
import {
  HeaderContainer,
  TitleSection,
  Title,
  Logo,
  IconsSection,
  IconButton,
  MenuDropdown,
  DropdownContent,
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
  NicknameButton,
  Avatar,
  AvatarButton,
  ColorRow,
  ColorSwatch,
  SectionLabel
} from '../styles/Header.styles'

const ACCOUNT_COLORS: Record<string, string> = {
  orange: '#ff9f19',
  blue: '#3b82f6',
  green: '#22a06b',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  red: '#ef4444',
  slate: '#8a94a6'
}
const DEFAULT_COLOR = 'orange'

interface HeaderProps {
  onSettingsClick?: () => void;
  onAddAccountClick?: () => void;
  onChangelogClick?: () => void;
  onAboutClick?: () => void;
  onMyAccountClick?: () => void;
}

export const Header = ({ onSettingsClick, onAddAccountClick, onChangelogClick, onAboutClick, onMyAccountClick }: HeaderProps) => {
  const { userData, logout, accounts, currentAccount, switchAccount } = useApp()
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false)
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showNicknameDialog, setShowNicknameDialog] = useState(false)
  const [nickname, setNickname] = useState('')
  const [accountNicknames, setAccountNicknames] = useState<Record<string, string>>({})
  const [accountColors, setAccountColors] = useState<Record<string, string>>({})
  const menuDropdownRef = useRef<HTMLDivElement>(null)
  const accountDropdownRef = useRef<HTMLDivElement>(null)

  const isPopout = window.location.search.includes('popout=1')

  const openSupport = () => window.open('https://github.com/Lanshuns/Qwacky#-support-the-project', '_blank')
  const openRepo = () => window.open('https://github.com/Lanshuns/Qwacky', '_blank')

  const handlePopout = () => {
    chrome.runtime.sendMessage({ action: 'popoutExtension' })
    window.close()
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
    setAccountDropdownOpen(false)
  }

  const handleLogoutConfirm = async () => {
    await logout()
    setShowLogoutConfirm(false)
  }

  const handleSwitchAccount = (username: string) => {
    switchAccount(username)
    setAccountDropdownOpen(false)
  }

  const handleAccountItemClick = (handler?: () => void) => {
    if (handler) {
      handler()
      setAccountDropdownOpen(false)
    }
  }

  const colorOf = (username: string) => ACCOUNT_COLORS[accountColors[username]] || ACCOUNT_COLORS[DEFAULT_COLOR]

  const handlePickColor = async (colorKey: string) => {
    if (!currentAccount) return
    const updated = { ...accountColors, [currentAccount]: colorKey }
    setAccountColors(updated)
    await chrome.storage.local.set({ accountColors: updated })
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
      setAccountDropdownOpen(false)
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
    const loadAccountMeta = async () => {
      const result = await chrome.storage.local.get(['accountNicknames', 'accountColors'])
      if (result.accountNicknames) {
        setAccountNicknames(result.accountNicknames)
      }
      if (result.accountColors) {
        setAccountColors(result.accountColors)
      }
    }
    loadAccountMeta()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target as Node)) {
        setMenuDropdownOpen(false)
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false)
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
        <TitleSection onClick={openRepo} title="Open the Qwacky repository">
          <Logo src="/assets/icons/qwacky.png" alt="Qwacky" />
          <Title>Qwacky</Title>
        </TitleSection>
        <IconsSection>
          {!isPopout && (
            <IconButton onClick={handlePopout} aria-label="Open in a window" title="Open in a window">
              <MdOpenInNew size={24} />
            </IconButton>
          )}
          {userData && currentAccount && (
            <MenuDropdown ref={accountDropdownRef}>
              <AvatarButton
                onClick={() => { setAccountDropdownOpen(!accountDropdownOpen); setMenuDropdownOpen(false) }}
                aria-label="Account menu"
                title="Account"
                aria-expanded={accountDropdownOpen}
              >
                <Avatar color={colorOf(currentAccount)}>{getDisplayName(currentAccount).charAt(0)}</Avatar>
              </AvatarButton>
              <DropdownContent isOpen={accountDropdownOpen}>
                <CurrentAccountItem>
                  <Avatar color={colorOf(currentAccount)} size={24}>{getDisplayName(currentAccount).charAt(0)}</Avatar>
                  <span className="username">{getDisplayName(currentAccount)}</span>
                  <MdEdit
                    size={22}
                    className="edit-icon"
                    onClick={handleEditNickname}
                    title="Edit nickname"
                  />
                </CurrentAccountItem>
                <ColorRow role="radiogroup" aria-label="Account colour">
                  {Object.entries(ACCOUNT_COLORS).map(([key, value]) => (
                    <ColorSwatch
                      key={key}
                      color={value}
                      selected={(accountColors[currentAccount] || DEFAULT_COLOR) === key}
                      role="radio"
                      aria-checked={(accountColors[currentAccount] || DEFAULT_COLOR) === key}
                      aria-label={key}
                      onClick={() => handlePickColor(key)}
                    />
                  ))}
                </ColorRow>
                <DropdownDivider />
                {accounts.length > 1 && (
                  <>
                    <SectionLabel>Switch to</SectionLabel>
                    {accounts
                      .filter(account => account.username !== currentAccount)
                      .map(account => (
                        <AccountItem
                          key={account.username}
                          onClick={() => handleSwitchAccount(account.username)}
                        >
                          <Avatar color={colorOf(account.username)} size={20}>{getDisplayName(account.username).charAt(0)}</Avatar>
                          <span className="username">{getDisplayName(account.username)}</span>
                        </AccountItem>
                      ))
                    }
                    <DropdownDivider />
                  </>
                )}
                <DropdownItem onClick={() => handleAccountItemClick(onAddAccountClick)}>
                  <MdPersonAdd size={20} />
                  Add account
                </DropdownItem>
                <DropdownItem onClick={() => handleAccountItemClick(onMyAccountClick)}>
                  <MdManageAccounts size={20} />
                  My account
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={handleLogoutClick} logout>
                  <MdLogout size={20} />
                  Log out
                </DropdownItem>
              </DropdownContent>
            </MenuDropdown>
          )}
          <MenuDropdown ref={menuDropdownRef}>
            <IconButton
              onClick={() => { setMenuDropdownOpen(!menuDropdownOpen); setAccountDropdownOpen(false) }}
              aria-label="Menu"
              title="Menu"
              aria-expanded={menuDropdownOpen}
            >
              <MdMenu size={24} />
            </IconButton>
            <DropdownContent isOpen={menuDropdownOpen}>
              <DropdownItem onClick={() => handleMenuItemClick(onSettingsClick)}>
                <MdSettings size={20} />
                Settings
              </DropdownItem>
              <DropdownItem onClick={() => handleMenuItemClick(onChangelogClick)}>
                <MdNewReleases size={20} />
                What's new?
              </DropdownItem>
              <DropdownItem onClick={() => handleMenuItemClick(openSupport)}>
                <MdFavorite size={20} />
                Support the project
              </DropdownItem>
              <DropdownItem onClick={() => handleMenuItemClick(onAboutClick)}>
                <MdInfoOutline size={20} />
                About
              </DropdownItem>
            </DropdownContent>
          </MenuDropdown>
        </IconsSection>
      </HeaderContainer>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Confirm logout"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {showNicknameDialog && (
        <NicknameEditDialog onClick={() => setShowNicknameDialog(false)}>
          <NicknameDialogContent onClick={(e) => e.stopPropagation()}>
            <NicknameDialogTitle>Edit account nickname</NicknameDialogTitle>
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
              {currentAccount && accountNicknames[currentAccount] && (
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
