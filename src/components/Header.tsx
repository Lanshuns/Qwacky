import { useState, useRef, useEffect } from 'react'
import { MdLogout, MdSettings, MdMenu, MdAccountCircle, MdPersonAdd, MdNewReleases, MdSwapHoriz, MdKeyboardArrowDown, MdEdit, MdCheck, MdClose, MdFavorite, MdInfoOutline, MdManageAccounts, MdOpenInNew } from 'react-icons/md'
import { useApp } from '../context/AppContext'
import { ConfirmDialog } from './ConfirmDialog'
import { RichText, useI18n } from '../i18n'
import {
  HeaderContainer,
  TitleSection,
  Title,
  Logo,
  IconsSection,
  IconButton,
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
  onMyAccountClick?: () => void;
}

export const Header = ({ onSettingsClick, onAddAccountClick, onChangelogClick, onAboutClick, onMyAccountClick }: HeaderProps) => {
  const { userData, logout, accounts, currentAccount, switchAccount } = useApp()
  const { t } = useI18n()
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [accountsListOpen, setAccountsListOpen] = useState(false)
  const [showNicknameDialog, setShowNicknameDialog] = useState(false)
  const [nickname, setNickname] = useState('')
  const [accountNicknames, setAccountNicknames] = useState<Record<string, string>>({})
  const menuDropdownRef = useRef<HTMLDivElement>(null)

  const isPopout = window.location.search.includes('popout=1')

  const openSupport = () => window.open('https://github.com/Lanshuns/Qwacky#-support-the-project', '_blank')
  const openRepo = () => window.open('https://github.com/Lanshuns/Qwacky', '_blank')

  const handlePopout = () => {
    chrome.runtime.sendMessage({ action: 'popoutExtension' })
    window.close()
  }

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
        <TitleSection onClick={openRepo}>
          <Logo src="/assets/icons/qwacky.png" alt="Qwacky" />
          <Title>Qwacky</Title>
        </TitleSection>
        <IconsSection>
          <IconButton onClick={openSupport} aria-label={t('header.support')} title={t('header.support')}>
            <MdFavorite size={24} />
          </IconButton>
          {!isPopout && (
            <IconButton onClick={handlePopout} aria-label={t('header.openInWindow')} title={t('header.openInWindow')}>
              <MdOpenInNew size={24} />
            </IconButton>
          )}
          <MenuDropdown ref={menuDropdownRef}>
            <IconButton onClick={() => setMenuDropdownOpen(!menuDropdownOpen)} aria-label={t('header.menu')}>
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
                        {t('header.switchAccount')}
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
                    {t('header.addAccount')}
                  </DropdownItem>
                  <DropdownItem onClick={() => handleMenuItemClick(onMyAccountClick)}>
                    <MdManageAccounts size={20} />
                    {t('header.myAccount')}
                  </DropdownItem>
                  <DropdownDivider />
                </>
              )}
              <DropdownItem onClick={() => handleMenuItemClick(onSettingsClick)}>
                <MdSettings size={20} />
                {t('header.settings')}
              </DropdownItem>
              <DropdownItem onClick={() => handleMenuItemClick(onChangelogClick)}>
                <MdNewReleases size={20} />
                {t('header.whatsNew')}
              </DropdownItem>
              <DropdownItem onClick={() => handleMenuItemClick(onAboutClick)}>
                <MdInfoOutline size={20} />
                {t('header.about')}
              </DropdownItem>
              {userData && (
                <>
                  <DropdownDivider />
                  <DropdownItem onClick={handleLogoutClick} logout>
                    <MdLogout size={20} />
                    {t('header.logout')}
                  </DropdownItem>
                </>
              )}
            </DropdownContent>
          </MenuDropdown>
        </IconsSection>
      </HeaderContainer>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title={t('header.logoutConfirmTitle')}
        message={t('header.logoutConfirmMessage')}
        confirmLabel={t('header.logout')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {showNicknameDialog && (
        <NicknameEditDialog onClick={() => setShowNicknameDialog(false)}>
          <NicknameDialogContent onClick={(e) => e.stopPropagation()}>
            <NicknameDialogTitle>{t('header.nicknameTitle')}</NicknameDialogTitle>
            <NicknameDialogSubtitle>
              <RichText text={t('header.nicknameSubtitle', { username: `<b>${currentAccount}</b>` })} />
            </NicknameDialogSubtitle>
            <NicknameInput
              type="text"
              placeholder={t('header.nicknamePlaceholder')}
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
                  {t('common.clear')}
                </NicknameButton>
              )}
              <NicknameButton onClick={() => setShowNicknameDialog(false)}>
                {t('common.cancel')}
              </NicknameButton>
              <NicknameButton primary onClick={handleSaveNickname}>
                <MdCheck size={18} />
                {t('common.save')}
              </NicknameButton>
            </NicknameDialogActions>
          </NicknameDialogContent>
        </NicknameEditDialog>
      )}
    </>
  )
}
