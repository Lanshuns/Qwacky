import styled from 'styled-components'
import { IconButton as BaseIconButton } from './SharedStyles'

export const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--qw-header-pad, 14px 16px);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 16px;
    right: 16px;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${props => props.theme.primary}40, transparent);
  }
`

export const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`

export const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: ${props => props.theme.primary};
  letter-spacing: -0.3px;
`

export const Logo = styled.img`
  width: 32px;
  height: 32px;
`

export const IconsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const IconButton = styled(BaseIconButton)`
  &.logout {
    color: ${props => props.theme.error};
  }
`

export const BaseDropdown = styled.div`
  position: relative;
  display: inline-block;
`

export const MenuDropdown = styled(BaseDropdown)``

export const DropdownContent = styled.div<{ isOpen: boolean }>`
  display: ${props => (props.isOpen ? 'block' : 'none')};
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  min-width: 220px;
  z-index: 100;
  border-radius: 12px;
  overflow: hidden;
  animation: ${props => props.isOpen ? 'scaleIn 0.15s ease-out' : 'none'};
  transform-origin: top right;
  background: ${props => props.theme.surfaceElevated};
  box-shadow: ${props => props.theme.shadowLg};
  border: 1px solid ${props => props.theme.border};
`

export const DropdownItem = styled.div<{ active?: boolean; current?: boolean; logout?: boolean }>`
  color: ${props => {
    if (props.logout) return props.theme.error;
    if (props.current) return props.theme.primary;
    return props.active ? props.theme.primary : props.theme.text;
  }};
  padding: 10px 16px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;
  border-left: 3px solid transparent;

  &:hover {
    background: ${props => props.logout ? `${props.theme.error}10` : `${props.theme.primary}10`};
    border-left-color: ${props => props.logout ? props.theme.error : props.theme.primary};
  }

  svg {
    color: ${props => {
      if (props.logout) return props.theme.error;
      return props.theme.primary;
    }};
  }
`

export const DropdownDivider = styled.div`
  height: 1px;
  background-color: ${props => props.theme.border};
  margin: 4px 0;
`

export const AccountItem = styled(DropdownItem)`
  padding: 8px 16px;
  font-size: 14px;

  &.current {
    color: ${props => props.theme.primary};
    font-weight: 500;

    svg {
      color: ${props => props.theme.primary};
    }
  }

  .username {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

export const CurrentAccountItem = styled.div`
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.primary};
  font-size: 14px;
  font-weight: 500;

  svg {
    color: ${props => props.theme.primary};
  }

  .username {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .edit-icon {
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    color: ${props => props.theme.primary};
    min-width: 32px;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: ${props => props.theme.hover};
    }
  }
`

export const NicknameEditDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.surfaceOverlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

export const NicknameDialogContent = styled.div`
  background: ${props => props.theme.surfaceElevated};
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: ${props => props.theme.shadowLg};
  border: 1px solid ${props => props.theme.border};
`

export const NicknameDialogTitle = styled.h3`
  margin: 0 0 8px 0;
  color: ${props => props.theme.text};
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.2px;
`

export const NicknameDialogSubtitle = styled.div`
  color: ${props => props.theme.textSecondary};
  font-size: 13px;
  margin-bottom: 16px;
`

export const NicknameInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  background: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
  font-size: 14px;
  margin-bottom: 16px;
  box-sizing: border-box;
  transition: all 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }

  &::placeholder {
    color: ${props => props.theme.textTertiary};
  }
`

export const NicknameDialogActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`

export const NicknameButton = styled.button<{ primary?: boolean }>`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;

  ${props => props.primary ? `
    background: ${props.theme.primary};
    color: ${props.theme.textOnPrimary};

    &:hover {
      opacity: 0.9;
    }
  ` : `
    background: ${props.theme.surface};
    color: ${props.theme.text};
    border: 1px solid ${props.theme.border};

    &:hover {
      background: ${props.theme.hover};
    }
  `}
`

export const Avatar = styled.span<{ color: string; size?: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${props => props.size || 28}px;
  height: ${props => props.size || 28}px;
  border-radius: 50%;
  font-size: ${props => Math.round((props.size || 28) * 0.46)}px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  color: ${props => props.color};
  background: ${props => props.color}22;
  border: 1.5px solid ${props => props.color}66;
`

export const AvatarButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${props => props.theme.hover};
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.borderFocus};
    outline-offset: 1px;
  }
`

export const ColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px 10px;
`

export const ColorSwatch = styled.button<{ color: string; selected?: boolean }>`
  width: 18px;
  height: 18px;
  padding: 0;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? props.theme.text : 'transparent'};
  background: ${props => props.color};
  box-shadow: 0 0 0 1px ${props => props.theme.surfaceElevated};
  cursor: pointer;
  transition: transform 0.1s ease;

  &:hover {
    transform: scale(1.15);
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.borderFocus};
    outline-offset: 1px;
  }
`

export const SectionLabel = styled.div`
  padding: 8px 16px 2px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${props => props.theme.textTertiary};
`
