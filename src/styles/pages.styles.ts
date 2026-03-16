import styled from 'styled-components'
import { BaseInput, PrimaryButton } from './SharedStyles'


export const LoginContainer = styled.div`
  padding: 32px 24px 24px;
  text-align: center;
`

export const LoginMessage = styled.p`
  color: ${props => props.theme.text};
  margin-bottom: 28px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.2px;
`

export const DuckText = styled.span`
  color: ${props => props.theme.primary};
  font-weight: 700;
`

export const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 20px;
`

export const LoginInput = styled(BaseInput)`
  padding: 12px 90px 12px 14px;
`

export const Suffix = styled.span`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.primary};
  pointer-events: none;
  user-select: none;
  font-size: 15px;
  font-weight: 600;
  opacity: 0.8;
`

export const LoginErrorMessage = styled.p`
  color: ${props => props.theme.error};
  margin-top: 12px;
  font-size: 13px;
  font-weight: 500;
`

export const SignupSection = styled.div`
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${props => props.theme.borderLight};
  text-align: center;
  font-size: 14px;
  color: ${props => props.theme.textSecondary};
`

export const SignupLink = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.primary};
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  padding: 0;
  transition: opacity 0.2s;

  &:hover {
    text-decoration: underline;
    opacity: 0.85;
  }
`


export const OTPContainer = styled.div`
  padding: 20px 24px;
  text-align: center;
`

export const OTPUsername = styled.div`
  display: inline-block;
  color: ${props => props.theme.primary};
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  padding: 4px 14px;
  background: ${props => props.theme.primary}10;
  border-radius: 20px;
`

export const OTPMessage = styled.p`
  color: ${props => props.theme.text};
  margin-bottom: 28px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
`

export const OTPInput = styled(BaseInput)`
  padding: 12px;
  margin-bottom: 16px;
  text-align: center;
`

export const OTPButton = styled(PrimaryButton)`
  margin-bottom: 16px;
`

export const OTPErrorMessage = styled.p`
  color: ${props => props.theme.error};
  margin-top: 12px;
  font-size: 13px;
  font-weight: 500;
`


export const DashboardContainer = styled.div`
  padding: 16px 20px;
`

export const GenerateButton = styled(PrimaryButton)`
  margin-bottom: 24px;
`

export const ReverseAliasSection = styled.div`
  margin-bottom: 24px;
  padding: 14px;
  background: ${props => props.theme.surfaceElevated};
  border: 1px solid ${props => props.theme.borderLight};
  border-radius: 8px;
`

export const ReverseAliasSteps = styled.ol`
  margin: 0 0 12px 0;
  padding-left: 20px;
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
  line-height: 1.6;

  li {
    margin-bottom: 2px;
  }

  strong {
    color: ${props => props.theme.text};
  }
`

export const ReverseAliasInputRow = styled.div`
  display: flex;
  gap: 8px;
`

export const ReverseAliasInput = styled(BaseInput)`
  padding: 10px 12px;
  font-size: 13px;
  flex: 1;
`

export const ReverseAliasConvertButton = styled.button`
  padding: 10px 14px;
  background: ${props => props.theme.primary};
  color: ${props => props.theme.textOnPrimary};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const InstructionsToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: ${props => props.theme.primary};
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  padding: 0;
  margin-bottom: 10px;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.8;
  }
`

export const LearnMoreLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.theme.primary};
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  margin-bottom: 12px;

  &:hover {
    text-decoration: underline;
  }
`

export const SenderSelector = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  color: ${props => props.theme.text};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;

  span:first-child {
    color: ${props => props.theme.textTertiary};
    font-weight: 600;
    font-size: 12px;
  }

  span:nth-child(2) {
    flex: 1;
    text-align: left;
    word-break: break-all;
  }

  svg {
    color: ${props => props.theme.textTertiary};
  }

  &:hover {
    border-color: ${props => props.theme.primary};
  }
`

export const PickerContainer = styled.div`
  background: ${props => props.theme.surfaceElevated};
  border-radius: 12px;
  width: 320px;
  max-height: 400px;
  box-shadow: ${props => props.theme.shadowLg};
  border: 1px solid ${props => props.theme.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

export const PickerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.theme.text};
  }

  button {
    background: none;
    border: none;
    color: ${props => props.theme.textSecondary};
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    transition: all 0.15s ease;

    &:hover {
      background: ${props => props.theme.primary}15;
      color: ${props => props.theme.primary};
    }
  }
`

export const PickerSearchInput = styled.input`
  margin: 0 16px 12px;
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  font-size: 13px;
  transition: all 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }

  &::placeholder {
    color: ${props => props.theme.textTertiary};
  }
`

export const PickerList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.border};
    border-radius: 3px;
  }
`

export const PickerItem = styled.button<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px 12px;
  background: ${props => props.active ? props.theme.primary + '15' : 'transparent'};
  border: 1px solid ${props => props.active ? props.theme.primary : 'transparent'};
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  margin-bottom: 4px;

  &:hover {
    background: ${props => props.active ? props.theme.primary + '20' : props.theme.hover};
  }
`

export const PickerItemText = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.theme.text};
  word-break: break-all;
`

export const PickerItemLabel = styled.div`
  font-size: 11px;
  color: ${props => props.theme.textTertiary};
  margin-top: 2px;
`


export const SettingsContainer = styled.div`
  padding: 16px 20px;
`

export const ExperimentalBadge = styled.span`
  background: ${props => props.theme.primary}15;
  color: ${props => props.theme.primary};
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 8px;
`

export const WarningIcon = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  cursor: help;

  svg {
    color: #ff9f19;
  }
`

export const WarningTooltip = styled.div`
  position: absolute;
  width: 200px;
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

  ${WarningIcon}:hover & {
    opacity: 1;
    visibility: visible;
  }
`

export const SyncToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
`

export const SyncToggleInput = styled.input`
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

export const SyncToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.border};
  transition: all 0.3s ease;
  border-radius: 24px;

  ${SyncToggleInput}:checked + & {
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

export const SyncStatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const SyncStatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: ${props => props.theme.textSecondary};

  strong {
    color: ${props => props.theme.text};
    margin-right: 8px;
  }
`

export const SyncStatValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const RefreshIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  color: ${props => props.theme.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.primary}15;
    color: ${props => props.theme.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    transition: transform 0.5s ease;
  }

  &:active:not(:disabled) svg {
    transform: rotate(360deg);
  }
`

export const ExportButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  width: 100%;
`

export const BackupButtonsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
  width: 100%;
`

export const BackupButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  cursor: pointer;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  justify-content: center;
  min-width: 0;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${props => props.theme.primary};
    background: ${props => props.theme.hover};
  }

  svg {
    color: ${props => props.theme.primary};
    min-width: 20px;
  }
`

export const HiddenFileInput = styled.input`
  display: none;
`


export const ChangelogContainer = styled.div`
  padding: 16px 20px;
`

export const ChangelogContent = styled.div`
  color: ${props => props.theme.text};
  font-size: 14px;
  line-height: 1.6;
  max-height: 400px;
  overflow-y: auto;

  h1 {
    font-size: 20px;
    margin-top: 0;
    margin-bottom: 20px;
    color: ${props => props.theme.text};
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  h2 {
    font-size: 16px;
    font-weight: 700;
    margin-top: 24px;
    margin-bottom: 12px;
    color: ${props => props.theme.primary};
    border-bottom: none;
    padding: 8px 12px;
    background: ${props => props.theme.primary}08;
    border-radius: 8px;
    border-left: 3px solid ${props => props.theme.primary};
  }

  h2:first-child {
    margin-top: 0;
  }

  h3 {
    font-size: 14px;
    font-weight: 600;
    margin-top: 16px;
    margin-bottom: 8px;
    color: ${props => props.theme.textSecondary};
  }

  ul {
    margin: 12px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
    position: relative;
    list-style-type: none;
    line-height: 1.5;

    &::before {
      content: "";
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${props => props.theme.primary};
      position: absolute;
      left: -16px;
      top: 8px;
    }
  }
`

export const ChangelogLoadingMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.theme.textSecondary};
  font-weight: 500;
`

export const ChangelogErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: ${props => props.theme.error};
  font-weight: 500;
`


export const AboutContainer = styled.div`
  padding: 16px 20px;
`

export const AppInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0 24px;
`

export const AppLogo = styled.img`
  width: 72px;
  height: 72px;
  margin-bottom: 16px;
`

export const AppName = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.primary};
  margin-bottom: 4px;
`

export const AppVersion = styled.span`
  font-size: 13px;
  color: ${props => props.theme.textTertiary};
  margin-bottom: 8px;
`

export const LinksSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 24px;
`

export const LinkItem = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${props => props.theme.primary};
    background: ${props => props.theme.hover};
  }

  svg:first-child {
    color: ${props => props.theme.primary};
  }

  svg:last-child {
    margin-left: auto;
    color: ${props => props.theme.textTertiary};
  }
`


export const MyAccountContainer = styled.div`
  padding: 16px 20px;
`

export const ManageAccountButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${props => props.theme.primary};
    background: ${props => props.theme.hover};
  }

  svg:first-child {
    color: ${props => props.theme.primary};
  }

  svg:last-child {
    margin-left: auto;
    color: ${props => props.theme.textTertiary};
  }
`
