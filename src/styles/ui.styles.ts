import styled from 'styled-components'
import { MdInfo } from 'react-icons/md'
import { Section as BaseSection, IconButton as BaseIconButton } from './SharedStyles'

export const NotificationContainer = styled.div<{ position?: { x: number; y: number } }>`
  position: fixed;
  background: ${props => props.theme.primary};
  color: ${props => props.theme.textOnPrimary};
  padding: 8px 16px;
  border-radius: 8px;
  z-index: 999999;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  animation: fadeIn 0.15s ease-out;
  pointer-events: none;

  ${props => props.position
    ? `
      left: ${props.position.x}px;
      top: ${props.position.y}px;
    `
    : `
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `
  }
`

export const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.surfaceOverlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

export const Dialog = styled.div`
  background: ${props => props.theme.surfaceElevated};
  border-radius: 12px;
  padding: 24px;
  width: 300px;
  box-shadow: ${props => props.theme.shadowLg};
  border: 1px solid ${props => props.theme.border};
`

export const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  svg {
    color: ${props => props.theme.primary};
  }
`

export const DialogTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`

export const DialogMessage = styled.div`
  margin: 0 0 20px 0;
  font-size: 14px;
  color: ${props => props.theme.textSecondary};
  white-space: pre-line;
  line-height: 1.5;
`

export const DialogButtonContainer = styled.div<{ singleButton?: boolean }>`
  display: flex;
  justify-content: ${props => props.singleButton ? 'center' : 'flex-end'};
  gap: 8px;
`

export const DialogButton = styled.button<{ variant?: 'primary' | 'secondary'; singleButton?: boolean }>`
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  ${props => {
    if (props.singleButton) {
      return `
        background: ${props.theme.primary};
        color: ${props.theme.textOnPrimary};
        &:hover {
          opacity: 0.9;
        }
      `;
    }
    if (props.variant === 'primary') {
      return `
        background: ${props.theme.surface};
        color: ${props.theme.text};
        border: 1px solid ${props.theme.border};
        &:hover {
          background: ${props.theme.hover};
        }
      `;
    }
    return `
      background: ${props.theme.primary};
      color: ${props.theme.textOnPrimary};
      &:hover {
        opacity: 0.9;
      }
    `;
  }}
`

export const ToggleContainer = styled.div<{ disabled?: boolean }>`
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.borderLight};
  background: ${props => props.theme.surfaceElevated};
  opacity: ${props => props.disabled ? 0.7 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.primary}30;
    box-shadow: ${props => props.theme.shadowSm};
  }
`

export const ToggleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`

export const ToggleTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  gap: 6px;
`

export const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  margin-left: 12px;
`

export const ToggleInput = styled.input`
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

export const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.border};
  transition: all 0.3s ease;
  border-radius: 24px;

  ${ToggleInput}:checked + & {
    background-color: ${props => props.theme.primary};
  }

  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: transform 0.3s ease;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`

export const ToggleDescription = styled.div`
  color: ${props => props.theme.textSecondary};
  font-size: 13px;
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

export const BrowserSpecificInfo = styled.div`
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background-color: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.borderLight};
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

export const StatusMessage = styled.p<{ type: 'info' | 'error' | 'success' }>`
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
  transition: color 0.15s ease;
`

export const InfoIcon = styled(MdInfo)`
  color: ${props => props.theme.primary};
  cursor: help;
`

export const Tooltip = styled.div`
  position: absolute;
  width: 220px;
  background: ${props => props.theme.glassBg};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: ${props => props.theme.text};
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  box-shadow: ${props => props.theme.shadowMd};
  border: 1px solid ${props => props.theme.glassBorder};
  z-index: 100;
  line-height: 1.4;
  left: 24px;
  top: -5px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;

  a {
    color: ${props => props.theme.primary};
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`

export const InfoIconContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
`

export const LinkText = styled.a`
  color: ${props => props.theme.primary};
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`

export const NoticeContainer = styled.div`
  text-align: left;
`

export const NoticeParagraph = styled.p`
  margin: 0 0 12px 0;
  line-height: 1.5;

  &:last-child {
    margin-bottom: 0;
  }
`

export const UserInfoCard = styled(BaseSection)``

export const InfoItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.borderLight};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-of-type {
    padding-top: 0;
  }

  label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 4px;
    color: ${props => props.theme.textTertiary};

    &.highlight {
      color: ${props => props.theme.primary};
    }
  }

  div {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 14px;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 6px;
    margin: 0 -8px;

    &:hover {
      background: ${props => props.theme.primary}08;
    }
  }
`

export const UserInfoIconButton = styled(BaseIconButton)`
  svg {
    width: 22px;
    height: 22px;
  }
`
