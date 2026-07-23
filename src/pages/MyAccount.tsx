import { useCallback, useState, useEffect, useMemo } from 'react'
import { MdArrowBack, MdOpenInNew, MdDeleteOutline } from 'react-icons/md'
import { useApp } from '../context/AppContext'
import { DuckService } from '../services/DuckService'
import { useNotification } from '../components/Notification'
import { UserInfoSection } from '../components/UserInfoSection'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { BackButton } from '../styles/SharedStyles'
import { MyAccountContainer, ManageAccountButton, DeleteAccountButton } from '../styles/pages.styles'

interface MyAccountProps {
  onBack: () => void
}

export const MyAccount = ({ onBack }: MyAccountProps) => {
  const { userData, currentAccount, deleteCurrentAccount } = useApp()
  const { showNotification, NotificationRenderer } = useNotification()
  const duckService = useMemo(() => new DuckService(), [])
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [counts, setCounts] = useState({ addresses: 0, aliases: 0 })

  useEffect(() => {
    Promise.all([duckService.getAddresses(), duckService.getReverseAliases()])
      .then(([addresses, aliases]) => setCounts({ addresses: addresses.length, aliases: aliases.length }))
      .catch(() => setCounts({ addresses: 0, aliases: 0 }))
  }, [duckService, currentAccount])

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

  const handleRemoveAccount = async () => {
    setShowRemoveConfirm(false)
    setRemoving(true)
    const result = await deleteCurrentAccount()
    setRemoving(false)
    if (result.status === 'success') {
      onBack()
    } else {
      showNotification(result.message || 'Failed to remove account')
    }
  }

  if (!userData) return null

  const accountLabel = currentAccount ? `${currentAccount}@duck.com` : 'this account'
  const addressText = `${counts.addresses} saved address${counts.addresses === 1 ? '' : 'es'}`
  const removedParts = counts.aliases > 0
    ? `${addressText} and ${counts.aliases} reverse alias${counts.aliases === 1 ? '' : 'es'}`
    : addressText

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
        Manage your duck account
        <MdOpenInNew size={16} />
      </ManageAccountButton>

      <DeleteAccountButton onClick={() => setShowRemoveConfirm(true)} disabled={removing}>
        <MdDeleteOutline size={20} />
        {removing ? 'Removing...' : 'Remove account local data'}
      </DeleteAccountButton>

      <ConfirmDialog
        isOpen={showRemoveConfirm}
        variant="warning"
        title="Remove account local data"
        message={`You're about to remove ${accountLabel} along with its ${removedParts} from this device and from sync. Your DuckDuckGo account itself is not affected. This cannot be undone.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={handleRemoveAccount}
        onCancel={() => setShowRemoveConfirm(false)}
      />

      <NotificationRenderer />
    </MyAccountContainer>
  )
}
