import { useCallback, useState, useEffect, useMemo } from 'react'
import { MdArrowBack, MdOpenInNew, MdDeleteOutline } from 'react-icons/md'
import { useApp } from '../context/AppContext'
import { DuckService } from '../services/DuckService'
import { useNotification } from '../components/Notification'
import { UserInfoSection } from '../components/UserInfoSection'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useI18n } from '../i18n'
import { BackButton } from '../styles/SharedStyles'
import { MyAccountContainer, ManageAccountButton, DeleteAccountButton } from '../styles/pages.styles'

interface MyAccountProps {
  onBack: () => void
}

export const MyAccount = ({ onBack }: MyAccountProps) => {
  const { userData, currentAccount, deleteCurrentAccount } = useApp()
  const { showNotification, NotificationRenderer } = useNotification()
  const { t } = useI18n()
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
      showNotification(t('common.copied'), event)
    } catch {
      showNotification(t('common.failedToCopy'), event)
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
      showNotification(result.message || t('myAccount.removeFailed'))
    }
  }

  if (!userData) return null

  const accountLabel = currentAccount ? `${currentAccount}@duck.com` : t('myAccount.thisAccount')
  const addressText = t('myAccount.savedAddresses', { count: counts.addresses })
  const removedParts = counts.aliases > 0
    ? t('myAccount.addressesAndAliases', {
        addresses: addressText,
        aliases: t('myAccount.reverseAliases', { count: counts.aliases })
      })
    : addressText

  return (
    <MyAccountContainer>
      <BackButton onClick={onBack}>
        <MdArrowBack size={20} />
        {t('common.back')}
      </BackButton>

      <UserInfoSection
        userData={userData}
        addressesCount={userData.stats.addresses_generated}
        copyToClipboard={copyToClipboard}
      />

      <ManageAccountButton onClick={handleOpenDuckDuckGoEmail}>
        <MdOpenInNew size={20} />
        {t('myAccount.manage')}
        <MdOpenInNew size={16} />
      </ManageAccountButton>

      <DeleteAccountButton onClick={() => setShowRemoveConfirm(true)} disabled={removing}>
        <MdDeleteOutline size={20} />
        {removing ? t('myAccount.removing') : t('myAccount.remove')}
      </DeleteAccountButton>

      <ConfirmDialog
        isOpen={showRemoveConfirm}
        variant="warning"
        title={t('myAccount.removeTitle')}
        message={t('myAccount.removeMessage', { account: accountLabel, data: removedParts })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleRemoveAccount}
        onCancel={() => setShowRemoveConfirm(false)}
      />

      <NotificationRenderer />
    </MyAccountContainer>
  )
}
