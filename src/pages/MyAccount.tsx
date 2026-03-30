import { useCallback } from 'react'
import { MdArrowBack, MdOpenInNew } from 'react-icons/md'
import { useApp } from '../context/AppContext'
import { useNotification } from '../components/Notification'
import { UserInfoSection } from '../components/UserInfoSection'
import { BackButton } from '../styles/SharedStyles'
import { MyAccountContainer, ManageAccountButton } from '../styles/pages.styles'

interface MyAccountProps {
  onBack: () => void
}

export const MyAccount = ({ onBack }: MyAccountProps) => {
  const { userData } = useApp()
  const { showNotification, NotificationRenderer } = useNotification()

  const copyToClipboard = useCallback(async (text: string, event?: MouseEvent) => {
    try {
      await navigator.clipboard.writeText(text)
      showNotification('Copied!', event)
    } catch {
      showNotification('Failed to copy', event)
    }
  }, [showNotification])

  const handleOpenDuckDuckGoEmail = () => {
    chrome.runtime.sendMessage({ action: 'openDdgEmail' })
  }

  if (!userData) return null

  return (
    <MyAccountContainer>
      <BackButton onClick={onBack}>
        <MdArrowBack size={20} />
        Back
      </BackButton>

      <UserInfoSection
        userData={userData}
        addressesCount={userData.stats.addresses_generated}
        copyToClipboard={copyToClipboard}
      />

      <ManageAccountButton onClick={handleOpenDuckDuckGoEmail}>
        <MdOpenInNew size={20} />
        Change Your Forwarding Address
        <MdOpenInNew size={16} />
      </ManageAccountButton>

      <NotificationRenderer />
    </MyAccountContainer>
  )
}
