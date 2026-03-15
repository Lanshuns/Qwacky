import styled from 'styled-components'
import { IconButton as BaseIconButton } from './SharedStyles'

export const Section = styled.div`
  margin-bottom: 24px;
`

export const HeaderActions = styled.div`
  display: flex;
  gap: 4px;
`

export const SearchContainer = styled.div`
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
  align-items: center;
`

export const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`

export const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 38px;
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
    font-size: 13px;
  }
`

export const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  color: ${props => props.theme.textSecondary};
  display: flex;
  align-items: center;
`

export const ClearSearchButton = styled.button`
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: ${props => props.theme.textSecondary};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.theme.primary}15;
    color: ${props => props.theme.primary};
  }
`

export const SortButton = styled.button<{ active?: boolean }>`
  padding: 10px 14px;
  background: ${props => props.active ? props.theme.primary : props.theme.surface};
  color: ${props => props.active ? 'white' : props.theme.text};
  border: 1px solid ${props => props.active ? props.theme.primary : props.theme.border};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.active ? props.theme.primary : props.theme.hover};
    border-color: ${props => props.theme.primary};
  }

  svg {
    font-size: 18px;
  }
`

export const SearchInfo = styled.div`
  margin-bottom: 12px;
  font-size: 13px;
  color: ${props => props.theme.textSecondary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const ResultCount = styled.span`
  font-weight: 500;
  color: ${props => props.theme.primary};
`

export const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${props => props.theme.textSecondary};

  svg {
    font-size: 56px;
    color: ${props => props.theme.primary}40;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: ${props => props.theme.text};
  }

  p {
    font-size: 14px;
    margin: 0;
    color: ${props => props.theme.textTertiary};
  }
`

export const AddressList = styled.div<{ hidden?: boolean }>`
  background: ${props => props.theme.surface};
  border-radius: 8px;
  padding: 8px;
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.borderLight};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.border};
    border-radius: 3px;

    &:hover {
      background: ${props => props.theme.textSecondary};
    }
  }
`

export const IconButton = styled(BaseIconButton)`
  border-radius: 6px;
  transition: all 0.15s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &.delete {
    color: ${props => props.theme.error};

    &:hover {
      background: ${props => props.theme.error}10;
      color: ${props => props.theme.error};
    }
  }

  &.clear {
    color: ${props => props.theme.error};

    &:hover {
      background: ${props => props.theme.error}10;
      color: ${props => props.theme.error};
    }
  }
`

export const AddressItem = styled.div`
  border-bottom: 1px solid ${props => props.theme.borderLight};
  padding: 10px 4px;
  position: relative;
  border-radius: 8px;
  transition: background 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${props => props.theme.primary}05;
  }

  .action-buttons {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover .action-buttons {
    opacity: 1;
  }
`

export const AddressMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 6px;
`

export const AddressHeader = styled.div`
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 8px;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.theme.primary}10;
    transform: translateX(2px);
  }
`

export const AddressText = styled.div`
  font-weight: 500;
  font-size: 14px;
  word-break: break-all;
  color: ${props => props.theme.text};
`

export const AddressTime = styled.div`
  color: ${props => props.theme.textTertiary};
  font-size: 12px;
  font-weight: 400;
  padding-left: 10px;
  margin-top: 2px;
`

export const NotesContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 8px 4px 8px;
  font-size: 14px;
`

export const Notes = styled.div`
  color: ${props => props.theme.textSecondary};
  flex: 1;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.4;
`

export const EmptyNotes = styled.div`
  color: ${props => props.theme.textTertiary};
  font-style: italic;
  flex: 1;
  font-size: 13px;
`

export const NotesEditContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`

export const NotesInput = styled.input`
  flex: 1;
  padding: 6px 8px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 6px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
  font-size: 13px;
  transition: all 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`

export const NotesActions = styled.div`
  display: flex;
  gap: 4px;
`

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 4px;
`
