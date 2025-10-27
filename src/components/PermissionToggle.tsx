import React, { useState, useEffect, useCallback, useRef } from 'react'
import styled from 'styled-components'
import { usePermissions, PERMISSIONS } from '../context/PermissionContext'
import { ConfirmDialog } from './ConfirmDialog'
import { MdInfo } from 'react-icons/md'
import Markdown from 'react-markdown'

declare const browser: typeof chrome
const api = typeof browser !== 'undefined' ? browser : chrome

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')

const CHROME_PERMISSION_NOTICE_SEEN = 'chromePermissionNoticeSeen'

interface ToggleContainerProps {
  disabled?: boolean
}

const ToggleContainer = styled.div<ToggleContainerProps>`
  margin-bottom: 16px;
  opacity: ${props => props.disabled ? 0.7 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  transition: opacity 0.3s ease;
`

const ToggleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`

const ToggleTitle = styled.div`
  font-weight: 500;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  gap: 6px;
`

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  margin-left: 12px;
`

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${props => props.theme.primary};
  }

  &:checked + span:before {
    transform: translateX(24px);
  }

  &:disabled + span {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.border};
  transition: background-color 0.4s ease;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: transform 0.4s ease;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`

const Description = styled.div`
  color: ${props => props.theme.textSecondary};
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
  
  a {
    color: ${props => props.theme.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  code {
    background: ${props => props.theme.hover};
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  }
`

const BrowserSpecificInfo = styled.div`
  margin-top: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: ${props => props.theme.hover};
  font-size: 13px;
  
  a {
    color: ${props => props.theme.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  code {
    background: ${props => props.theme.surface};
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  }
`

const StatusMessage = styled.p<{ type: 'info' | 'error' | 'success' }>`
  color: ${props => {
    switch (props.type) {
      case 'error': return props.theme.error;
      case 'success': return props.theme.success;
      default: return props.theme.primary;
    }
  }};
  font-size: 13px;
  margin: 8px 0 0;
  font-weight: 500;
  transition: color 0.3s ease;
`

const InfoIcon = styled(MdInfo)`
  color: ${props => props.theme.primary};
  cursor: help;
`

const Tooltip = styled.div`
  position: absolute;
  width: 220px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  border: 1px solid ${props => props.theme.border};
  z-index: 100;
  line-height: 1.4;
  left: 24px;
  top: -5px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  a {
    color: ${props => props.theme.primary};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`

const InfoIconContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
`

const LinkText = styled.a`
  color: ${props => props.theme.primary};
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`

interface PermissionToggleProps {
  name: string
  description: string
  isEnabled: boolean
  onChange: (enabled: boolean) => void
  disabled?: boolean
}

const NoticeContainer = styled.div`
  text-align: left;
`;

const NoticeParagraph = styled.p`
  margin: 0 0 12px 0;
  line-height: 1.5;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

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

          setTimeout(() => {
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

          setTimeout(() => {
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
      <Description>
        <Markdown>{description}</Markdown>
      </Description>
      
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