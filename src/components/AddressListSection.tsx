import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MdVisibility, MdVisibilityOff, MdEdit, MdCheck, MdClose, MdDelete, MdDeleteSweep, MdSearch, MdSort, MdClear, MdLabel, MdExpandMore, MdExpandLess } from "react-icons/md";
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
  ItemSubtext,
  TagFilterRow,
  TagFilterChip,
  GroupByButton,
  GroupHeader,
  GroupName,
  GroupCount,
  TagChipContainer,
  TagChip,
  TagChipRemove,
  TagInputContainer,
  TagInput,
  TagSuggestions,
  TagSuggestionItem
} from '../styles/AddressListSection.styles';

export interface ListItem {
  key: string;
  primaryText: string;
  secondaryText?: string;
  copyText: string;
  copyLabel: string;
  timestamp: number;
  notes?: string;
  tags?: string[];
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
  onUpdateTags?: (key: string, tags: string[]) => Promise<void>;
  allTags?: string[];
}

interface EditingState {
  key: string;
  notes: string;
  autoFocus?: boolean;
}

type SortOrder = 'newest' | 'oldest';

const renderItem = (
  item: ListItem,
  index: number,
  copyToClipboard: (text: string, event?: MouseEvent) => void,
  formatTime: (timestamp: number) => string,
  editing: EditingState | null,
  setEditing: React.Dispatch<React.SetStateAction<EditingState | null>>,
  notesInputRef: React.RefObject<HTMLInputElement>,
  handleEditNotes: (item: ListItem) => void,
  handleSaveNotes: () => void,
  handleCancelEdit: () => void,
  setDeleteConfirm: React.Dispatch<React.SetStateAction<string | null>>,
  editingTags: string | null,
  setEditingTags: React.Dispatch<React.SetStateAction<string | null>>,
  tagInputValue: string,
  setTagInputValue: React.Dispatch<React.SetStateAction<string>>,
  onUpdateTags?: (key: string, tags: string[]) => Promise<void>,
  allTags?: string[]
) => {
  const itemTags = item.tags || [];

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed || itemTags.includes(trimmed) || !onUpdateTags) return;
    onUpdateTags(item.key, [...itemTags, trimmed]);
    setTagInputValue('');
  };

  const handleRemoveTag = (tag: string) => {
    if (!onUpdateTags) return;
    onUpdateTags(item.key, itemTags.filter(t => t !== tag));
  };

  const suggestions = allTags?.filter(t =>
    tagInputValue.trim() &&
    t.toLowerCase().includes(tagInputValue.toLowerCase()) &&
    !itemTags.includes(t)
  ) || [];

  return (
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

      {itemTags.length > 0 && (
        <TagChipContainer>
          {itemTags.map(tag => (
            <TagChip key={tag}>
              {tag}
              {onUpdateTags && (
                <TagChipRemove onClick={() => handleRemoveTag(tag)} aria-label={`Remove tag ${tag}`}>
                  &times;
                </TagChipRemove>
              )}
            </TagChip>
          ))}
        </TagChipContainer>
      )}

      {editingTags === item.key && onUpdateTags && (
        <TagInputContainer>
          <TagInput
            value={tagInputValue}
            onChange={(e) => setTagInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                handleAddTag(tagInputValue);
              } else if (e.key === 'Escape') {
                setEditingTags(null);
                setTagInputValue('');
              }
            }}
            placeholder="Add tag..."
            autoFocus
          />
          <IconButton onClick={() => { setEditingTags(null); setTagInputValue(''); }} aria-label="Close tag input">
            <MdClose size={16} />
          </IconButton>
          {suggestions.length > 0 && (
            <TagSuggestions>
              {suggestions.map(s => (
                <TagSuggestionItem key={s} onClick={() => handleAddTag(s)}>
                  {s}
                </TagSuggestionItem>
              ))}
            </TagSuggestions>
          )}
        </TagInputContainer>
      )}

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
            {onUpdateTags && (
              <IconButton
                onClick={() => {
                  setEditingTags(editingTags === item.key ? null : item.key);
                  setTagInputValue('');
                }}
                aria-label="Edit tags"
              >
                <MdLabel size={18} />
              </IconButton>
            )}
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
  );
};

export const ItemListSection: React.FC<ItemListSectionProps> = ({
  items,
  config,
  copyToClipboard,
  formatTime,
  onUpdateNotes,
  onDeleteItem,
  onClearAll,
  autoEditKey,
  onAutoEditComplete,
  onUpdateTags,
  allTags
}) => {
  const [hidden, setHidden] = useState(false);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [groupByTag, setGroupByTag] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [tagInputValue, setTagInputValue] = useState('');
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

  const uniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach(item => {
      (item.tags || []).forEach(t => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [items]);

  const filteredAndSorted = useMemo(() => {
    let filtered = items;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.primaryText.toLowerCase().includes(query) ||
        (item.secondaryText && item.secondaryText.toLowerCase().includes(query)) ||
        (item.notes && item.notes.toLowerCase().includes(query)) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(query)))
      );
    }

    if (activeTagFilter === '__untagged__') {
      filtered = filtered.filter(item => !item.tags || item.tags.length === 0);
    } else if (activeTagFilter) {
      filtered = filtered.filter(item => item.tags?.includes(activeTagFilter));
    }

    const sorted = [...filtered];
    if (sortOrder === 'newest') {
      sorted.sort((a, b) => b.timestamp - a.timestamp);
    } else {
      sorted.sort((a, b) => a.timestamp - b.timestamp);
    }
    return sorted;
  }, [items, searchQuery, sortOrder, activeTagFilter]);

  const groupedItems = useMemo(() => {
    if (!groupByTag) return null;

    const groups = new Map<string, ListItem[]>();
    const untagged: ListItem[] = [];

    filteredAndSorted.forEach(item => {
      const tags = item.tags || [];
      if (tags.length === 0) {
        untagged.push(item);
      } else {
        tags.forEach(tag => {
          if (!groups.has(tag)) groups.set(tag, []);
          groups.get(tag)!.push(item);
        });
      }
    });

    const result: Array<{ name: string; items: ListItem[] }> = [];
    Array.from(groups.keys()).sort().forEach(tag => {
      result.push({ name: tag, items: groups.get(tag)! });
    });
    if (untagged.length > 0) {
      result.push({ name: 'Untagged', items: untagged });
    }
    return result;
  }, [filteredAndSorted, groupByTag]);

  const cycleSortOrder = useCallback(() => {
    setSortOrder(current => current === 'newest' ? 'oldest' : 'newest');
  }, []);

  const toggleGroup = useCallback((groupName: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  }, []);

  const getSortLabel = () => sortOrder === 'newest' ? 'Newest' : 'Oldest';

  const renderItemCallback = useCallback((item: ListItem, index: number) => {
    return renderItem(
      item, index, copyToClipboard, formatTime,
      editing, setEditing, notesInputRef,
      handleEditNotes, handleSaveNotes, handleCancelEdit,
      setDeleteConfirm,
      editingTags, setEditingTags, tagInputValue, setTagInputValue,
      onUpdateTags, allTags
    );
  }, [copyToClipboard, formatTime, editing, handleEditNotes, handleSaveNotes, handleCancelEdit, editingTags, tagInputValue, onUpdateTags, allTags]);

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
          <p>Try adjusting your search or filter</p>
        </EmptyState>
      );
    }

    if (groupByTag && groupedItems) {
      return (
        <AddressList hidden={hidden} role="list" aria-label={config.title}>
          {groupedItems.map(group => (
            <React.Fragment key={group.name}>
              <GroupHeader onClick={() => toggleGroup(group.name)}>
                {collapsedGroups.has(group.name) ? <MdExpandMore size={18} /> : <MdExpandLess size={18} />}
                <GroupName>{group.name}</GroupName>
                <GroupCount>({group.items.length})</GroupCount>
              </GroupHeader>
              {!collapsedGroups.has(group.name) && group.items.map((item, index) => renderItemCallback(item, index))}
            </React.Fragment>
          ))}
        </AddressList>
      );
    }

    return (
      <AddressList hidden={hidden} role="list" aria-label={config.title}>
        {filteredAndSorted.map((item, index) => renderItemCallback(item, index))}
      </AddressList>
    );
  }, [filteredAndSorted, groupedItems, groupByTag, hidden, config, collapsedGroups, toggleGroup, renderItemCallback, items.length]);

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
              {uniqueTags.length > 0 && (
                <GroupByButton onClick={() => setGroupByTag(prev => !prev)} active={groupByTag} aria-label="Group by tag">
                  <MdLabel />
                  Group
                </GroupByButton>
              )}
            </SearchContainer>

            {uniqueTags.length > 0 && (
              <TagFilterRow>
                <TagFilterChip active={activeTagFilter === null} onClick={() => setActiveTagFilter(null)}>
                  All
                </TagFilterChip>
                {uniqueTags.map(tag => (
                  <TagFilterChip key={tag} active={activeTagFilter === tag} onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}>
                    {tag}
                  </TagFilterChip>
                ))}
                <TagFilterChip active={activeTagFilter === '__untagged__'} onClick={() => setActiveTagFilter(activeTagFilter === '__untagged__' ? null : '__untagged__')}>
                  Untagged
                </TagFilterChip>
              </TagFilterRow>
            )}

            {(searchQuery || activeTagFilter) && (
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
