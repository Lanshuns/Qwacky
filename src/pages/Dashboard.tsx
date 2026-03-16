import { useState, useEffect, useCallback, useMemo } from "react";
import { MdInfo, MdOpenInNew, MdKeyboardArrowDown, MdClose, MdCheck } from "react-icons/md";
import { useApp } from "../context/AppContext";
import { DuckService } from "../services/DuckService";
import { ReverseAlias } from "../types";
import { useNotification } from "../components/Notification";

import { ItemListSection, ListItem, ListConfig } from "../components/AddressListSection";
import { DashboardTabs } from "../components/DashboardTabs";
import { DialogOverlay } from "../styles/ui.styles";
import {
  DashboardContainer,
  GenerateButton,
  ReverseAliasSection,
  ReverseAliasSteps,
  ReverseAliasInputRow,
  ReverseAliasInput,
  ReverseAliasConvertButton,
  InstructionsToggle,
  LearnMoreLink,
  SenderSelector,
  PickerContainer,
  PickerHeader,
  PickerSearchInput,
  PickerList,
  PickerItem,
  PickerItemText,
  PickerItemLabel,
} from "../styles/pages.styles";

interface StoredAddress {
  value: string;
  timestamp: number;
  notes?: string;
}

const GENERATE_LIST_CONFIG: ListConfig = {
  title: "Generated Addresses",
  itemsLabel: "addresses",
  emptyTitle: "No addresses yet",
  emptySubtitle: "Click the button above to generate your first address",
  searchPlaceholder: "Search addresses or notes...",
  deleteTitle: "Delete Address",
  getDeleteMessage: (key) => `Are you sure you want to delete this address\n(${key}@duck.com)?`,
  clearTitle: "Clear All Addresses",
  clearMessage: "Are you sure you want to clear all addresses?\n\nThis action cannot be undone.",
  hideStorageKey: "hide_generated_addresses",
};

const SEND_LIST_CONFIG: ListConfig = {
  title: "History",
  itemsLabel: "aliases",
  emptyTitle: "No history yet",
  emptySubtitle: "Convert a recipient email above to get started",
  searchPlaceholder: "Search emails or notes...",
  deleteTitle: "Delete Reverse Alias",
  getDeleteMessage: (key) => `Are you sure you want to delete the reverse alias for\n${key}?`,
  clearTitle: "Clear All History",
  clearMessage: "Are you sure you want to clear all reverse alias history?\n\nThis action cannot be undone.",
  hideStorageKey: "hide_reverse_aliases",
};

export const Dashboard = () => {
  const { userData, currentAccount } = useApp();
  const [addresses, setAddresses] = useState<StoredAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoEditAddress, setAutoEditAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'send'>('generate');
  const [recipientEmail, setRecipientEmail] = useState("");
  const [reverseAliases, setReverseAliases] = useState<ReverseAlias[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedSender, setSelectedSender] = useState<string | null>(null);
  const [showAliasPicker, setShowAliasPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const duckService = new DuckService();
  const { showNotification, NotificationRenderer } = useNotification();

  useEffect(() => {
    chrome.storage.local.get('dashboardActiveTab', (result) => {
      if (result.dashboardActiveTab === 'generate' || result.dashboardActiveTab === 'send') {
        setActiveTab(result.dashboardActiveTab);
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ dashboardActiveTab: activeTab });
  }, [activeTab]);

  useEffect(() => {
    if (userData) {
      const loadData = async () => {
        try {
          const [loadedAddresses, loadedAliases] = await Promise.all([
            duckService.getAddresses(),
            duckService.getReverseAliases()
          ]);
          setAddresses(loadedAddresses);
          setReverseAliases(loadedAliases);
        } catch (error) {
          console.error('Error loading data:', error);
          setAddresses([]);
          setReverseAliases([]);
        }
      };

      loadData();
    } else {
      setAddresses([]);
      setReverseAliases([]);
    }
  }, [userData, currentAccount]);

  const copyToClipboard = useCallback((text: string, event?: MouseEvent) => {
    navigator.clipboard.writeText(text);
    showNotification("Copied!", event);
  }, [showNotification]);

  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      month: "short",
      day: "numeric",
    });
  }, []);

  const generateNewAddress = async () => {
    setLoading(true);
    try {
      const response = await duckService.generateAddress();

      if (response.status === "success" && response.address) {
        const newAddress = {
          value: response.address,
          timestamp: Date.now(),
          notes: ''
        };
        setAddresses([newAddress, ...addresses]);
        copyToClipboard(response.address + "@duck.com");
        setAutoEditAddress(response.address);
      }
    } catch (error) {
      console.error("Error generating address:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddressNotes = async (key: string, notes: string) => {
    const success = await duckService.updateAddressNotes(key, notes);
    if (success) {
      setAddresses(prev => prev.map(addr =>
        addr.value === key ? { ...addr, notes } : addr
      ));
    }
  };

  const handleDeleteAddress = async (key: string) => {
    const success = await duckService.deleteAddress(key);
    if (success) {
      setAddresses(prev => prev.filter(addr => addr.value !== key));
    }
  };

  const handleClearAllAddresses = async () => {
    const success = await duckService.clearAllAddresses();
    if (success) {
      setAddresses([]);
    }
  };

  const effectiveSender = useMemo(() => {
    if (selectedSender && addresses.some(a => a.value === selectedSender)) {
      return selectedSender;
    }
    return null;
  }, [selectedSender, addresses]);

  const filteredPickerAddresses = useMemo(() => {
    if (!pickerSearch.trim()) return addresses;
    const q = pickerSearch.toLowerCase();
    return addresses.filter(a =>
      a.value.toLowerCase().includes(q) ||
      (a.notes && a.notes.toLowerCase().includes(q))
    );
  }, [addresses, pickerSearch]);

  const handleConvertReverseAlias = async (event?: React.MouseEvent) => {
    const email = recipientEmail.trim();
    if (!email || !email.includes("@") || !email.includes(".")) return;
    const senderLocal = effectiveSender || userData!.user.username;
    const alias = email.replace("@", "_at_") + "_" + senderLocal + "@duck.com";

    await duckService.saveReverseAlias(email, alias);

    setReverseAliases(prev => {
      const existingIndex = prev.findIndex(a => a.recipientEmail === email);
      if (existingIndex !== -1) {
        const item = { ...prev[existingIndex], alias, timestamp: Date.now() };
        return [item, ...prev.filter((_, i) => i !== existingIndex)];
      }
      return [{
        recipientEmail: email,
        alias,
        timestamp: Date.now(),
        notes: '',
        username: senderLocal
      }, ...prev];
    });

    navigator.clipboard.writeText(alias);
    showNotification("Copied!", event?.nativeEvent);
    setRecipientEmail("");
  };

  const handleUpdateReverseAliasNotes = async (key: string, notes: string) => {
    const success = await duckService.updateReverseAliasNotes(key, notes);
    if (success) {
      setReverseAliases(prev => prev.map(a =>
        a.recipientEmail === key ? { ...a, notes } : a
      ));
    }
  };

  const handleDeleteReverseAlias = async (key: string) => {
    const success = await duckService.deleteReverseAlias(key);
    if (success) {
      setReverseAliases(prev => prev.filter(a => a.recipientEmail !== key));
    }
  };

  const handleClearAllReverseAliases = async () => {
    const success = await duckService.clearAllReverseAliases();
    if (success) {
      setReverseAliases([]);
    }
  };

  const addressItems: ListItem[] = useMemo(() =>
    addresses.map(addr => ({
      key: addr.value,
      primaryText: addr.value + "@duck.com",
      copyText: addr.value + "@duck.com",
      copyLabel: `Copy ${addr.value}@duck.com`,
      timestamp: addr.timestamp,
      notes: addr.notes,
    })),
    [addresses]
  );

  const reverseAliasItems: ListItem[] = useMemo(() =>
    reverseAliases.map(a => ({
      key: a.recipientEmail,
      primaryText: a.recipientEmail,
      secondaryText: a.alias,
      copyText: a.alias,
      copyLabel: `Copy reverse alias for ${a.recipientEmail}`,
      timestamp: a.timestamp,
      notes: a.notes,
    })),
    [reverseAliases]
  );

  if (!userData) return null;

  return (
    <DashboardContainer>
      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'generate' && (
        <>
          <GenerateButton onClick={generateNewAddress} disabled={loading}>
            {loading ? "Generating..." : "Generate New Address"}
          </GenerateButton>
          <ItemListSection
            items={addressItems}
            config={GENERATE_LIST_CONFIG}
            copyToClipboard={copyToClipboard}
            formatTime={formatTime}
            onUpdateNotes={handleUpdateAddressNotes}
            onDeleteItem={handleDeleteAddress}
            onClearAll={handleClearAllAddresses}
            autoEditKey={autoEditAddress}
            onAutoEditComplete={() => setAutoEditAddress(null)}
          />
        </>
      )}

      {activeTab === 'send' && (
        <>
          <ReverseAliasSection>
            <InstructionsToggle onClick={() => setShowInstructions(prev => !prev)}>
              <MdInfo size={14} />
              {showInstructions ? 'Hide' : 'How to use'}
            </InstructionsToggle>

            {showInstructions && (
              <>
                <ReverseAliasSteps>
                  <li>Enter recipient's email & click <strong>Convert</strong></li>
                  <li>Paste the result as <strong>To</strong> in your email client</li>
                  <li>Send from the email linked to your DDG account</li>
                </ReverseAliasSteps>
                <LearnMoreLink
                  href="https://duckduckgo.com/duckduckgo-help-pages/email-protection/duck-addresses/how-do-i-compose-a-new-email"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more <MdOpenInNew size={12} />
                </LearnMoreLink>
              </>
            )}

            {addresses.length > 0 && (
              <SenderSelector onClick={() => { setShowAliasPicker(true); setPickerSearch(''); }}>
                <span>From:</span>
                <span>{(effectiveSender || userData!.user.username) + '@duck.com'}</span>
                <MdKeyboardArrowDown size={18} />
              </SenderSelector>
            )}

            <ReverseAliasInputRow>
              <ReverseAliasInput
                type="email"
                placeholder="someone@email.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConvertReverseAlias(e as unknown as React.MouseEvent);
                }}
              />
              <ReverseAliasConvertButton
                onClick={handleConvertReverseAlias}
                disabled={!recipientEmail.trim().includes("@")}
              >
                Convert
              </ReverseAliasConvertButton>
            </ReverseAliasInputRow>
          </ReverseAliasSection>

          {showAliasPicker && (
            <DialogOverlay onClick={(e) => { if (e.target === e.currentTarget) { setShowAliasPicker(false); setPickerSearch(''); } }}>
              <PickerContainer>
                <PickerHeader>
                  <h3>Send from</h3>
                  <button onClick={() => { setShowAliasPicker(false); setPickerSearch(''); }}>
                    <MdClose size={20} />
                  </button>
                </PickerHeader>
                <PickerSearchInput
                  placeholder="Search addresses..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  autoFocus
                />
                <PickerList>
                  <PickerItem
                    active={!effectiveSender}
                    onClick={() => { setSelectedSender(null); setShowAliasPicker(false); setPickerSearch(''); }}
                  >
                    <PickerItemText>
                      {userData!.user.username}@duck.com
                      {!effectiveSender && <MdCheck size={14} style={{ marginLeft: 6, verticalAlign: 'middle' }} />}
                    </PickerItemText>
                    <PickerItemLabel>Personal address</PickerItemLabel>
                  </PickerItem>
                  {filteredPickerAddresses.map(addr => (
                    <PickerItem
                      key={addr.value}
                      active={effectiveSender === addr.value}
                      onClick={() => { setSelectedSender(addr.value); setShowAliasPicker(false); setPickerSearch(''); }}
                    >
                      <PickerItemText>
                        {addr.value}@duck.com
                        {effectiveSender === addr.value && <MdCheck size={14} style={{ marginLeft: 6, verticalAlign: 'middle' }} />}
                      </PickerItemText>
                      {addr.notes && <PickerItemLabel>{addr.notes}</PickerItemLabel>}
                    </PickerItem>
                  ))}
                </PickerList>
              </PickerContainer>
            </DialogOverlay>
          )}
          <ItemListSection
            items={reverseAliasItems}
            config={SEND_LIST_CONFIG}
            copyToClipboard={copyToClipboard}
            formatTime={formatTime}
            onUpdateNotes={handleUpdateReverseAliasNotes}
            onDeleteItem={handleDeleteReverseAlias}
            onClearAll={handleClearAllReverseAliases}
          />
        </>
      )}

      <NotificationRenderer />
    </DashboardContainer>
  );
};
