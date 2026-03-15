import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MdVisibility, MdVisibilityOff, MdEdit, MdCheck, MdClose, MdDelete, MdDeleteSweep, MdSearch, MdSort, MdClear } from "react-icons/md";
import { ConfirmDialog } from './ConfirmDialog';
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
  ButtonsContainer,
  ItemSubtext
} from '../styles/AddressListSection.styles';

export interface ListItem {
  key: string;
  primaryText: string;
  secondaryText?: string;
  copyText: string;
  copyLabel: string;
  timestamp: number;
  notes?: string;
}

export interface ListConfig {
  title: string;
  itemsLabel: string;
  emptyTitle: string;
  emptySubtitle: string;
  searchPlaceholder: string;
  deleteTitle: string;
  getDeleteMessage: (key: string) => string;
  clearTitle: string;
  clearMessage: string;
  hideStorageKey: string;
}

interface ItemListSectionProps {
  items: ListItem[];
  config: ListConfig;
  copyToClipboard: (text: string, event?: MouseEvent) => void;
  formatTime: (timestamp: number) => string;
  onUpdateNotes: (key: string, notes: string) => Promise<void>;
  onDeleteItem: (key: string) => Promise<void>;
  onClearAll: () => Promise<void>;
  autoEditKey?: string | null;
  onAutoEditComplete?: () => void;
}

interface EditingState {
  key: string;
  notes: string;
  autoFocus?: boolean;
}

type SortOrder = 'newest' | 'oldest';

export const ItemListSection: React.FC<ItemListSectionProps> = ({
  items,
  config,
  copyToClipboard,
  formatTime,
  onUpdateNotes,
  onDeleteItem,
  onClearAll,
  autoEditKey,
  onAutoEditComplete
}) => {
  const [hidden, setHidden] = useState(false);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const notesInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoEditKey) {
      const item = items.find(i => i.key === autoEditKey);
      if (item) {
        setEditing({ key: item.key, notes: item.notes || '', autoFocus: true });
        onAutoEditComplete?.();
        setTimeout(() => {
          notesInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          notesInputRef.current?.focus();
        }, 100);
      }
    }
  }, [autoEditKey, items, onAutoEditComplete]);

  useEffect(() => {
    chrome.storage.local.get(config.hideStorageKey, (result) => {
      setHidden(result[config.hideStorageKey] || false);
    });
  }, [config.hideStorageKey]);

  const toggleHidden = useCallback(() => {
    setHidden(prev => {
      const newState = !prev;
      chrome.storage.local.set({ [config.hideStorageKey]: newState });
      return newState;
    });
  }, [config.hideStorageKey]);

  const handleEditNotes = useCallback((item: ListItem) => {
    setEditing({ key: item.key, notes: item.notes || '', autoFocus: true });
    setTimeout(() => notesInputRef.current?.focus(), 50);
  }, []);

  const handleSaveNotes = useCallback(async () => {
    if (!editing) return;
    await onUpdateNotes(editing.key, editing.notes);
    setEditing(null);
  }, [editing, onUpdateNotes]);

  const handleCancelEdit = useCallback(() => setEditing(null), []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteConfirm) {
      await onDeleteItem(deleteConfirm);
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, onDeleteItem]);

  const handleClearConfirm = useCallback(async () => {
    await onClearAll();
    setShowClearConfirm(false);
  }, [onClearAll]);

  const filteredAndSorted = useMemo(() => {
    let filtered = items;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = items.filter(item =>
        item.primaryText.toLowerCase().includes(query) ||
        (item.secondaryText && item.secondaryText.toLowerCase().includes(query)) ||
        (item.notes && item.notes.toLowerCase().includes(query))
      );
    }
    const sorted = [...filtered];
    if (sortOrder === 'newest') {
      sorted.sort((a, b) => b.timestamp - a.timestamp);
    } else {
      sorted.sort((a, b) => a.timestamp - b.timestamp);
    }
    return sorted;
  }, [items, searchQuery, sortOrder]);

  const cycleSortOrder = useCallback(() => {
    setSortOrder(current => current === 'newest' ? 'oldest' : 'newest');
  }, []);

  const getSortLabel = () => sortOrder === 'newest' ? 'Newest' : 'Oldest';

  const itemList = useMemo(() => {
    if (items.length === 0) {
      return (
        <EmptyState>
          <MdSearch />
          <h3>{config.emptyTitle}</h3>
          <p>{config.emptySubtitle}</p>
        </EmptyState>
      );
    }

    if (filteredAndSorted.length === 0) {
      return (
        <EmptyState>
          <MdSearch />
          <h3>No results found</h3>
          <p>Try adjusting your search query</p>
        </EmptyState>
      );
    }

    return (
      <AddressList hidden={hidden} role="list" aria-label={config.title}>
        {filteredAndSorted.map((item, index) => (
          <AddressItem key={`${item.key}-${index}`} role="listitem">
            <AddressMain>
              <AddressHeader
                onClick={(e) => copyToClipboard(item.copyText, e.nativeEvent)}
                role="button"
                aria-label={item.copyLabel}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    copyToClipboard(item.copyText, e.nativeEvent as unknown as MouseEvent);
                  }
                }}
              >
                <AddressText>{item.primaryText}</AddressText>
                {item.secondaryText && <ItemSubtext>{item.secondaryText}</ItemSubtext>}
              </AddressHeader>
            </AddressMain>
            <AddressTime>{formatTime(item.timestamp)}</AddressTime>

            {editing && editing.key === item.key ? (
              <NotesEditContainer>
                <NotesInput
                  ref={editing.autoFocus ? notesInputRef : null}
                  value={editing.notes}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleSaveNotes(); }
                    else if (e.key === 'Escape') { e.preventDefault(); handleCancelEdit(); }
                  }}
                  placeholder="Add notes..."
                  aria-label="Edit notes"
                  autoFocus={editing.autoFocus}
                />
                <NotesActions>
                  <IconButton onClick={handleSaveNotes} aria-label="Save notes">
                    <MdCheck size={18} />
                  </IconButton>
                  <IconButton onClick={handleCancelEdit} aria-label="Cancel editing">
                    <MdClose size={18} />
                  </IconButton>
                </NotesActions>
              </NotesEditContainer>
            ) : (
              <NotesContainer>
                {item.notes && <Notes>{item.notes}</Notes>}
                <ButtonsContainer className="action-buttons">
                  <IconButton onClick={() => handleEditNotes(item)} aria-label="Edit notes">
                    <MdEdit size={18} />
                  </IconButton>
                  <IconButton className="delete" onClick={() => setDeleteConfirm(item.key)} aria-label="Delete">
                    <MdDelete size={18} />
                  </IconButton>
                </ButtonsContainer>
              </NotesContainer>
            )}
          </AddressItem>
        ))}
      </AddressList>
    );
  }, [filteredAndSorted, hidden, editing, copyToClipboard, formatTime, handleEditNotes, handleSaveNotes, handleCancelEdit, config]);

  return (
    <>
      <Section>
        <SectionHeader>
          <h2>{config.title}</h2>
          <HeaderActions>
            {items.length > 0 && (
              <IconButton className="clear" onClick={() => setShowClearConfirm(true)} aria-label={`Clear all ${config.itemsLabel}`}>
                <MdDeleteSweep size={24} />
              </IconButton>
            )}
            <IconButton onClick={toggleHidden} aria-label={hidden ? `Show ${config.itemsLabel}` : `Hide ${config.itemsLabel}`} aria-expanded={!hidden}>
              {hidden ? <MdVisibility /> : <MdVisibilityOff />}
            </IconButton>
          </HeaderActions>
        </SectionHeader>

        {items.length > 0 && (
          <>
            <SearchContainer>
              <SearchInputWrapper>
                <SearchIcon><MdSearch size={20} /></SearchIcon>
                <SearchInput
                  type="text"
                  placeholder={config.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label={`Search ${config.itemsLabel}`}
                />
                {searchQuery && (
                  <ClearSearchButton onClick={() => setSearchQuery('')} aria-label="Clear search">
                    <MdClear size={20} />
                  </ClearSearchButton>
                )}
              </SearchInputWrapper>
              <SortButton onClick={cycleSortOrder} active={sortOrder !== 'newest'} aria-label={`Sort by ${getSortLabel()}`}>
                <MdSort />
                {getSortLabel()}
              </SortButton>
            </SearchContainer>

            {searchQuery && (
              <SearchInfo>
                <span>
                  Showing <ResultCount>{filteredAndSorted.length}</ResultCount> of {items.length} {config.itemsLabel}
                </span>
              </SearchInfo>
            )}
          </>
        )}

        {itemList}
      </Section>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title={config.deleteTitle}
        message={deleteConfirm ? config.getDeleteMessage(deleteConfirm) : ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />

      <ConfirmDialog
        isOpen={showClearConfirm}
        title={config.clearTitle}
        message={config.clearMessage}
        confirmLabel="Clear All"
        cancelLabel="Cancel"
        onConfirm={handleClearConfirm}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  );
};
