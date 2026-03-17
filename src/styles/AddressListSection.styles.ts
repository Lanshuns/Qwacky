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
  border: 1px solid ${props => props.theme.borderLight};
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

  @media (hover: none) {
    .action-buttons {
      opacity: 1;
    }
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

export const ItemSubtext = styled.div`
  font-size: 11px;
  color: ${props => props.theme.textTertiary};
  word-break: break-all;
  margin-top: 2px;
  font-family: monospace;
`

export const TagFilterRow = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  align-items: center;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.border};
    border-radius: 2px;
  }
`

export const TagFilterChip = styled.button<{ active?: boolean }>`
  padding: 4px 10px;
  background: ${props => props.active ? props.theme.primary : props.theme.surface};
  color: ${props => props.active ? 'white' : props.theme.textSecondary};
  border: 1px solid ${props => props.active ? props.theme.primary : props.theme.border};
  border-radius: 12px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.active ? props.theme.primary : props.theme.hover};
    border-color: ${props => props.theme.primary};
  }
`

export const GroupByButton = styled.button<{ active?: boolean }>`
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

export const GroupHeader = styled.div<{ tagColor?: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  cursor: pointer;
  border-radius: 6px;
  border-left: 3px solid ${props => props.tagColor || props.theme.primary};
  margin-bottom: 4px;
  transition: background 0.15s ease;

  &:hover {
    background: ${props => props.theme.hover};
  }
`

export const GroupName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.text};
`

export const GroupCount = styled.span`
  font-size: 11px;
  color: ${props => props.theme.textTertiary};
  font-weight: 500;
`

export const TagChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px 8px;
`

export const TagChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  background: ${props => props.theme.primary}18;
  color: ${props => props.theme.primary};
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
`

export const TagChipRemove = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  font-size: 13px;
  opacity: 0.7;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }
`

export const TagInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  position: relative;
`

export const TagInput = styled.input`
  padding: 3px 8px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 6px;
  background: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
  font-size: 12px;
  width: 120px;
  transition: all 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }

  &::placeholder {
    color: ${props => props.theme.textTertiary};
    font-size: 12px;
  }
`

export const TagSuggestions = styled.div`
  position: absolute;
  top: 100%;
  left: 8px;
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  max-height: 120px;
  overflow-y: auto;
  min-width: 120px;
`

export const TagSuggestionItem = styled.button`
  display: block;
  width: 100%;
  padding: 6px 10px;
  border: none;
  background: none;
  color: ${props => props.theme.text};
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s ease;

  &:hover {
    background: ${props => props.theme.hover};
  }
`
