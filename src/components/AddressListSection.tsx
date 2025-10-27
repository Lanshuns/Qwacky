import React, { useState, useMemo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { MdVisibility, MdVisibilityOff, MdEdit, MdCheck, MdClose, MdDelete, MdDeleteSweep, MdSearch, MdSort, MdClear } from "react-icons/md";
import { ConfirmDialog } from './ConfirmDialog';
import { StorageService } from '../services/StorageService';

const storageService = new StorageService();

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  h2 {
    font-size: 18px;
    margin: 0;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const SearchContainer = styled.div`
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 2px solid ${props => props.theme.border};
  border-radius: 8px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.primary}15;
  }

  &::placeholder {
    color: ${props => props.theme.textTertiary};
    font-size: 13px;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  color: ${props => props.theme.textSecondary};
  display: flex;
  align-items: center;
`;

const ClearSearchButton = styled.button`
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: ${props => props.theme.textSecondary};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 4px;

  &:hover {
    background: ${props => props.theme.hover};
    color: ${props => props.theme.text};
  }
`;

const SortButton = styled.button<{ active?: boolean }>`
  padding: 10px 12px;
  background: ${props => props.active ? props.theme.primary : props.theme.surface};
  color: ${props => props.active ? 'white' : props.theme.text};
  border: 2px solid ${props => props.active ? props.theme.primary : props.theme.border};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;

  &:hover {
    background: ${props => props.active ? props.theme.primary : props.theme.hover};
    border-color: ${props => props.theme.primary};
  }

  svg {
    font-size: 18px;
  }
`;

const SearchInfo = styled.div`
  margin-bottom: 12px;
  font-size: 13px;
  color: ${props => props.theme.textSecondary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResultCount = styled.span`
  font-weight: 500;
  color: ${props => props.theme.primary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.theme.textSecondary};

  svg {
    font-size: 48px;
    color: ${props => props.theme.textTertiary};
    margin-bottom: 16px;
  }

  h3 {
    font-size: 16px;
    margin: 0 0 8px 0;
    color: ${props => props.theme.text};
  }

  p {
    font-size: 14px;
    margin: 0;
  }
`;

const AddressList = styled.div<{ hidden?: boolean }>`
  background: ${(props) => props.theme.surface};
  border-radius: 8px;
  padding: 12px;
  max-height: 600px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.border};
    border-radius: 4px;

    &:hover {
      background: ${props => props.theme.textSecondary};
    }
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.text};
  cursor: pointer;
  padding: 4px;

  svg {
    width: 24px;
    height: 24px;
  }
  
  &.delete {
    color: #e53935;
    
    &:hover {
      color: #c62828;
    }
  }

  &.clear {
    color: #e53935;
    
    &:hover {
      color: #c62828;
    }
  }
`;

const AddressItem = styled.div`
  border-bottom: 1px solid ${props => props.theme.border};
  padding: 12px 0;
  position: relative;
  
  &:last-child {
    border-bottom: none;
  }

  .action-buttons {
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .action-buttons {
    opacity: 1;
  }
`;

const AddressMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 6px;
`;

const AddressHeader = styled.div`
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  
  &:hover {
    background-color: ${props => props.theme.hover};
  }
`;

const AddressText = styled.div`
  font-weight: 500;
  word-break: break-all;
  color: ${props => props.theme.text};
`;

const AddressTime = styled.div`
  color: ${props => props.theme.textSecondary};
  font-size: 11px;
  font-weight: 400;
  padding-left: 8px;
`;

const NotesContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 8px 4px 8px;
  font-size: 14px;
`;

const Notes = styled.div`
  color: ${props => props.theme.textSecondary};
  flex: 1;
  word-wrap: break-word;
`;

const EmptyNotes = styled.div`
  color: ${props => props.theme.textTertiary};
  font-style: italic;
  flex: 1;
`;

const NotesEditContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const NotesInput = styled.input`
  flex: 1;
  padding: 6px 8px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const NotesActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 4px;
`;

interface StoredAddress {
  value: string;
  timestamp: number;
  notes?: string;
}

interface EditingState {
  addressValue: string;
  notes: string;
  autoFocus?: boolean;
}

interface AddressListSectionProps {
  addresses: StoredAddress[];
  copyToClipboard: (text: string, event?: MouseEvent) => void;
  formatTime: (timestamp: number) => string;
  onUpdateNotes: (addressValue: string, notes: string) => Promise<void>;
  onDeleteAddress: (addressValue: string) => Promise<void>;
  onClearAllAddresses: () => Promise<void>;
  autoEditAddress?: string | null;
  onAutoEditComplete?: () => void;
}

type SortOrder = 'newest' | 'oldest';

export const AddressListSection: React.FC<AddressListSectionProps> = ({
  addresses,
  copyToClipboard,
  formatTime,
  onUpdateNotes,
  onDeleteAddress,
  onClearAllAddresses,
  autoEditAddress,
  onAutoEditComplete
}) => {
  const [hideAddresses, setHideAddresses] = useState(false);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const notesInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoEditAddress) {
      const address = addresses.find(addr => addr.value === autoEditAddress);
      if (address) {
        setEditing({
          addressValue: address.value,
          notes: address.notes || '',
          autoFocus: true
        });
        if (onAutoEditComplete) {
          onAutoEditComplete();
        }
        
        setTimeout(() => {
          notesInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          notesInputRef.current?.focus();
        }, 100);
      }
    }
  }, [autoEditAddress, addresses, onAutoEditComplete]);

  const handleEditNotes = useCallback((address: StoredAddress) => {
    setEditing({
      addressValue: address.value,
      notes: address.notes || '',
      autoFocus: true
    });
    
    setTimeout(() => {
      notesInputRef.current?.focus();
    }, 50);
  }, []);

  const handleSaveNotes = useCallback(async () => {
    if (!editing) return;
    
    await onUpdateNotes(editing.addressValue, editing.notes);
    setEditing(null);
  }, [editing, onUpdateNotes]);

  const handleCancelEdit = useCallback(() => {
    setEditing(null);
  }, []);

  const handleDeleteClick = useCallback((addressValue: string) => {
    setDeleteConfirm(addressValue);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteConfirm) {
      await onDeleteAddress(deleteConfirm);
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, onDeleteAddress]);

  const handleClearConfirm = useCallback(async () => {
    await onClearAllAddresses();
    setShowClearConfirm(false);
  }, [onClearAllAddresses]);

  const toggleHideAddresses = useCallback(() => {
    setHideAddresses(prev => {
      const newState = !prev;
      storageService.setHideGeneratedAddresses(newState);
      return newState;
    });
  }, []);

  useEffect(() => {
    const fetchHideAddresses = async () => {
      const storedHide = await storageService.getHideGeneratedAddresses();
      setHideAddresses(storedHide);
    };
    fetchHideAddresses();
  }, []);

  const filteredAndSortedAddresses = useMemo(() => {
    let filtered = addresses;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = addresses.filter(addr => 
        addr.value.toLowerCase().includes(query) ||
        (addr.notes && addr.notes.toLowerCase().includes(query))
      );
    }

    const sorted = [...filtered];
    switch (sortOrder) {
      case 'newest':
        sorted.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'oldest':
        sorted.sort((a, b) => a.timestamp - b.timestamp);
        break;
    }

    return sorted;
  }, [addresses, searchQuery, sortOrder]);

  const cycleSortOrder = useCallback(() => {
    setSortOrder(current => {
      if (current === 'newest') return 'oldest';
      return 'newest';
    });
  }, []);

  const getSortLabel = () => {
    switch (sortOrder) {
      case 'newest': return 'Newest';
      case 'oldest': return 'Oldest';
    }
  };

  const addressList = useMemo(() => {
    if (addresses.length === 0) {
      return (
        <EmptyState>
          <MdSearch />
          <h3>No addresses yet</h3>
          <p>Click the button above to generate your first address</p>
        </EmptyState>
      );
    }

    if (filteredAndSortedAddresses.length === 0) {
      return (
        <EmptyState>
          <MdSearch />
          <h3>No results found</h3>
          <p>Try adjusting your search query</p>
        </EmptyState>
      );
    }

    return (
      <AddressList 
        hidden={hideAddresses} 
        role="list" 
        aria-label="Generated email addresses"
      >
        {filteredAndSortedAddresses.map((address, index) => (
          <AddressItem 
            key={`${address.value}-${index}`} 
            role="listitem"
          >
            <AddressMain>
              <AddressHeader 
                onClick={(e) => copyToClipboard(address.value + "@duck.com", e.nativeEvent)}
                role="button"
                aria-label={`Copy ${address.value}@duck.com to clipboard`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    copyToClipboard(address.value + "@duck.com", e.nativeEvent as unknown as MouseEvent);
                  }
                }}
              >
                <AddressText>{address.value}@duck.com</AddressText>
              </AddressHeader>
            </AddressMain>
            <AddressTime>{formatTime(address.timestamp)}</AddressTime>
            
            {editing && editing.addressValue === address.value ? (
              <NotesEditContainer>
                <NotesInput 
                  ref={editing.autoFocus ? notesInputRef : null}
                  value={editing.notes}
                  onChange={(e) => setEditing({...editing, notes: e.target.value})}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveNotes();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      handleCancelEdit();
                    }
                  }}
                  placeholder="Add notes for this address..."
                  aria-label="Edit notes for this address"
                  autoFocus={editing.autoFocus}
                />
                <NotesActions>
                  <IconButton 
                    onClick={handleSaveNotes}
                    aria-label="Save notes"
                  >
                    <MdCheck size={18} />
                  </IconButton>
                  <IconButton 
                    onClick={handleCancelEdit}
                    aria-label="Cancel editing"
                  >
                    <MdClose size={18} />
                  </IconButton>
                </NotesActions>
              </NotesEditContainer>
            ) : (
              <NotesContainer>
                {address.notes ? (
                  <Notes>{address.notes}</Notes>
                ) : (
                  <EmptyNotes>No notes</EmptyNotes>
                )}
                <ButtonsContainer className="action-buttons">
                  <IconButton 
                    onClick={() => handleEditNotes(address)}
                    aria-label="Edit notes"
                  >
                    <MdEdit size={18} />
                  </IconButton>
                  <IconButton 
                    className="delete" 
                    onClick={() => handleDeleteClick(address.value)}
                    aria-label="Delete address"
                  >
                    <MdDelete size={18} />
                  </IconButton>
                </ButtonsContainer>
              </NotesContainer>
            )}
          </AddressItem>
        ))}
      </AddressList>
    );
  }, [filteredAndSortedAddresses, hideAddresses, editing, copyToClipboard, formatTime, handleEditNotes, handleSaveNotes, handleCancelEdit, handleDeleteClick]);

  return (
    <>
      <Section>
        <SectionHeader>
          <h2 id="addresses-heading">Generated Addresses</h2>
          <HeaderActions>
            {addresses.length > 0 && (
              <IconButton 
                className="clear"
                onClick={() => setShowClearConfirm(true)}
                aria-label="Clear all addresses"
              >
                <MdDeleteSweep size={24} />
              </IconButton>
            )}
            <IconButton 
              onClick={toggleHideAddresses}
              aria-label={hideAddresses ? "Show addresses" : "Hide addresses"}
              aria-expanded={!hideAddresses}
              aria-controls="addresses-list"
            >
              {hideAddresses ? <MdVisibility /> : <MdVisibilityOff />}
            </IconButton>
          </HeaderActions>
        </SectionHeader>

        {addresses.length > 0 && (
          <>
            <SearchContainer>
              <SearchInputWrapper>
                <SearchIcon>
                  <MdSearch size={20} />
                </SearchIcon>
                <SearchInput
                  type="text"
                  placeholder="Search addresses or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search addresses"
                />
                {searchQuery && (
                  <ClearSearchButton
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <MdClear size={20} />
                  </ClearSearchButton>
                )}
              </SearchInputWrapper>
              <SortButton
                onClick={cycleSortOrder}
                active={sortOrder !== 'newest'}
                aria-label={`Sort by ${getSortLabel()}`}
              >
                <MdSort />
                {getSortLabel()}
              </SortButton>
            </SearchContainer>

            {searchQuery && (
              <SearchInfo>
                <span>
                  Showing <ResultCount>{filteredAndSortedAddresses.length}</ResultCount> of {addresses.length} addresses
                </span>
              </SearchInfo>
            )}
          </>
        )}

        <div id="addresses-list" aria-labelledby="addresses-heading">
          {addressList}
        </div>
      </Section>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="Delete Address"
        message={`Are you sure you want to delete this address\n(${deleteConfirm}@duck.com)?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />

      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear All Addresses"
        message={"Are you sure you want to clear all addresses?\n\nThis action cannot be undone."}
        confirmLabel="Clear All"
        cancelLabel="Cancel"
        onConfirm={handleClearConfirm}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  );
};