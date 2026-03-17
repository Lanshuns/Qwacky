import React, { useState, useEffect, useCallback, useRef } from 'react'
import { usePermissions, PERMISSIONS } from '../context/PermissionContext'
import { ConfirmDialog } from './ConfirmDialog'
import Markdown from 'react-markdown'
import {
  ToggleContainer,
  ToggleHeader,
  ToggleTitle,
  ToggleSwitch,
  ToggleInput,
  ToggleSlider,
  ToggleDescription,
  BrowserSpecificInfo,
  StatusMessage,
  InfoIcon,
  Tooltip,
  InfoIconContainer,
  LinkText,
  NoticeContainer,
  NoticeParagraph
} from '../styles/ui.styles'

declare const browser: typeof chrome
const api = typeof browser !== 'undefined' ? browser : chrome

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')

const CHROME_PERMISSION_NOTICE_SEEN = 'chromePermissionNoticeSeen'

interface PermissionToggleProps {
  name: string
  description: string
  isEnabled: boolean
  onChange: (enabled: boolean) => void
  disabled?: boolean
}

export const PermissionToggle: React.FC<PermissionToggleProps> = ({
  name,
  description,
  isEnabled,
  onChange,
  disabled = false
}) => {
  const [status, setStatus] = useState<{ message: string; type: 'info' | 'error' | 'success' } | null>(null)
  const [showPermissionsNotice, setShowPermissionsNotice] = useState(false)
  const [showChromeNotice, setShowChromeNotice] = useState(false)
  const [chromeNoticeSeen, setChromeNoticeSeen] = useState(false)
  const { requestPermissions, removePermissions, checkPermission } = usePermissions()
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipTimeoutRef = useRef<number | null>(null);
  const reloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const permissionType = Object.entries(PERMISSIONS).find(
    ([_, permission]) => permission.name === name
  )?.[0] as keyof typeof PERMISSIONS | undefined;

  const isRequired = permissionType ? PERMISSIONS[permissionType]?.isRequired : false;

  const browserSpecificInfo = permissionType && PERMISSIONS[permissionType]?.browserSpecificInfo
    ? isFirefox
      ? PERMISSIONS[permissionType].browserSpecificInfo?.firefox
      : PERMISSIONS[permissionType].browserSpecificInfo?.chrome
    : undefined;

  const showTooltip = () => {
    if (tooltipTimeoutRef.current) {
      window.clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setTooltipVisible(true);
  };

  const hideTooltip = () => {
    tooltipTimeoutRef.current = window.setTimeout(() => {
      setTooltipVisible(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        window.clearTimeout(tooltipTimeoutRef.current);
      }
      if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isFirefox) {
      const checkChromeNoticeSeen = async () => {
        try {
          const result = await api.storage.local.get(CHROME_PERMISSION_NOTICE_SEEN)
          setChromeNoticeSeen(Boolean(result[CHROME_PERMISSION_NOTICE_SEEN]))
        } catch (err) {
          console.error('Error checking Chrome notice status:', err)
        }
      }

      checkChromeNoticeSeen()
    }
  }, [])

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [status])

  const handleNoticeDone = useCallback(async () => {
    setShowPermissionsNotice(false)
    try {
      await requestPermissions('contextMenuFeatures')
    } catch (error) {
      console.error('Error requesting permissions:', error)
    }
  }, [requestPermissions])

  const handleChromeNoticeDone = useCallback(async () => {
    setShowChromeNotice(false)
    try {
      await api.storage.local.set({ [CHROME_PERMISSION_NOTICE_SEEN]: true })
      setChromeNoticeSeen(true)

      await requestPermissions('contextMenuFeatures')
    } catch (error) {
      console.error('Error handling Chrome notice:', error)
    }
  }, [requestPermissions])

  const handleToggle = useCallback(async (newState: boolean) => {
    if (disabled || isRequired) return

    try {
      if (newState) {
        const hasPermission = await checkPermission('contextMenuFeatures')
        if (!hasPermission) {
          if (isFirefox) {
            setShowPermissionsNotice(true)
            return
          } else {
            if (!chromeNoticeSeen) {
              setShowChromeNotice(true)
              return
            }
            const granted = await requestPermissions('contextMenuFeatures')
            if (!granted) {
              setStatus({ message: 'Permission request was denied', type: 'error' })
              onChange(false)
              return
            }
          }
        }
        const response = await api.runtime.sendMessage({
          action: 'toggleFeature',
          enabled: true
        })
        if (response?.success) {
          setStatus({ message: 'Reloading to apply changes...', type: 'success' })
          onChange(true)

          if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current)
          reloadTimeoutRef.current = setTimeout(() => {
            api.runtime.sendMessage({ action: 'reload-extension' })
          }, 1500)
        } else {
          setStatus({ message: 'Failed to enable feature', type: 'error' })
          onChange(false)
        }
      } else {
        setStatus({ message: `Disabling ${name}...`, type: 'info' })
        const response = await api.runtime.sendMessage({
          action: 'toggleFeature',
          enabled: false
        })
        if (response?.success) {
          setStatus({ message: 'Reloading to apply changes...', type: 'success' })
          await removePermissions('contextMenuFeatures')
          onChange(false)

          if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current)
          reloadTimeoutRef.current = setTimeout(() => {
            api.runtime.sendMessage({ action: 'reload-extension' })
          }, 1500)
        } else {
          setStatus({ message: 'Failed to disable feature', type: 'error' })
          onChange(true)
        }
      }
    } catch (error) {
      console.error('Toggle error:', error)
      setStatus({ message: 'An error occurred', type: 'error' })
      onChange(!newState)
    }
  }, [name, disabled, onChange, removePermissions, checkPermission, requestPermissions, chromeNoticeSeen, isRequired])

  const FirefoxPermissionNotice = () => (
    <NoticeContainer>
      <NoticeParagraph>To enable this feature:</NoticeParagraph>
      <NoticeParagraph>1. Firefox will show a permissions request - click 'Allow'</NoticeParagraph>
      <NoticeParagraph>2. Return to the extension and toggle the feature again</NoticeParagraph>
      <NoticeParagraph>You can disable this feature anytime later.</NoticeParagraph>
    </NoticeContainer>
  );

  const ChromePermissionNotice = () => (
    <NoticeContainer>
      <NoticeParagraph>Chrome handles permissions differently than Firefox.</NoticeParagraph>
      <NoticeParagraph>To enable this feature, Chrome will show a permission request once. After clicking 'Done', a permissions dialog may appear.</NoticeParagraph>
      <NoticeParagraph>If you see a permissions dialog, click 'Allow' then return to the extension and toggle the feature again.</NoticeParagraph>
      <NoticeParagraph>For more details, see: <LinkText
          href="https://github.com/Lanshuns/Qwacky?tab=readme-ov-file#browser-specific-permission-handling-and-limitations"
          target="_blank"
          rel="noopener noreferrer"
        >
          Browser-Specific Permission Handling and Limitations
        </LinkText>
      </NoticeParagraph>
    </NoticeContainer>
  );

  return (
    <ToggleContainer disabled={disabled && !isRequired}>
      <ToggleHeader>
        <ToggleTitle>
          {name}
          {!isFirefox && name === "Autofill" && (
            <InfoIconContainer
              onMouseEnter={showTooltip}
              onMouseLeave={hideTooltip}
              onClick={showTooltip}
            >
              <InfoIcon size={16} />
              <Tooltip
                style={{
                  opacity: tooltipVisible ? 1 : 0,
                  visibility: tooltipVisible ? 'visible' : 'hidden'
                }}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
              >
                Browser additional permissions request will only appear once if not already granted.{' '}
                <LinkText
                  href="https://github.com/Lanshuns/Qwacky?tab=readme-ov-file#browser-specific-permission-handling-and-limitations"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read More
                </LinkText>
              </Tooltip>
            </InfoIconContainer>
          )}
        </ToggleTitle>
        <ToggleSwitch>
          <ToggleInput
            type="checkbox"
            checked={isEnabled}
            onChange={e => handleToggle(e.target.checked)}
            disabled={disabled || isRequired}
          />
          <ToggleSlider />
        </ToggleSwitch>
      </ToggleHeader>
      <ToggleDescription>
        <Markdown>{description}</Markdown>
      </ToggleDescription>

      {browserSpecificInfo && (
        <BrowserSpecificInfo>
          <Markdown>{browserSpecificInfo}</Markdown>
        </BrowserSpecificInfo>
      )}

      {status && (
        <StatusMessage type={status.type}>
          {status.message}
        </StatusMessage>
      )}
      <ConfirmDialog
        isOpen={showPermissionsNotice}
        title="Permissions Notice"
        message={<FirefoxPermissionNotice />}
        confirmLabel="Done"
        onConfirm={handleNoticeDone}
        singleButton={true}
        variant="info"
      />
      <ConfirmDialog
        isOpen={showChromeNotice}
        title="Permissions Notice"
        message={<ChromePermissionNotice />}
        confirmLabel="Done"
        onConfirm={handleChromeNoticeDone}
        singleButton={true}
        variant="info"
      />
    </ToggleContainer>
  )
}
