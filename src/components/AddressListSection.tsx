import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MdVisibility, MdVisibilityOff, MdEdit, MdCheck, MdClose, MdDelete, MdDeleteSweep, MdSearch, MdSort, MdClear } from "react-icons/md";
import { ConfirmDialog } from './ConfirmDialog';
import { StorageService } from '../services/StorageService';
import { SectionHeader } from '../styles/SharedStyles';
import {
  Section,
  HeaderActions,
  SearchContainer,
  SearchInputWrapper,
  SearchInput,
  SearchIcon,
  ClearSearchButton,
  SortButton,
  SearchInfo,
  ResultCount,
  EmptyState,
  AddressList,
  IconButton,
  AddressItem,
  AddressMain,
  AddressHeader,
  AddressText,
  AddressTime,
  NotesContainer,
  Notes,
  NotesEditContainer,
  NotesInput,
  NotesActions,
  ButtonsContainer
} from '../styles/AddressListSection.styles';

const storageService = new StorageService();

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
                {address.notes && (
                  <Notes>{address.notes}</Notes>
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
