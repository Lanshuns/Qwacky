import { useState, useEffect, useCallback, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { DuckService } from "../services/DuckService";
import { ReverseAlias } from "../types";
import { useNotification } from "../components/Notification";

import { ItemListSection, ListItem, ListConfig } from "../components/AddressListSection";
import { DashboardTabs } from "../components/DashboardTabs";
import {
  DashboardContainer,
  GenerateButton,
  ReverseAliasSection,
  ReverseAliasSteps,
  ReverseAliasInputRow,
  ReverseAliasInput,
  ReverseAliasConvertButton,
  ReverseAliasResult,
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
  const [reverseAlias, setReverseAlias] = useState<string | null>(null);
  const [reverseAliases, setReverseAliases] = useState<ReverseAlias[]>([]);
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

  // --- Generate tab handlers ---

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

  // --- Send tab handlers ---

  const handleConvertReverseAlias = async (event?: React.MouseEvent) => {
    const email = recipientEmail.trim();
    if (!email || !email.includes("@") || !email.includes(".")) return;
    const username = userData!.user.username;
    const alias = email.replace("@", "_at_") + "_" + username + "@duck.com";

    const existing = reverseAliases.find(a => a.recipientEmail === email);
    if (!existing) {
      await duckService.saveReverseAlias(email, alias);
      setReverseAliases(prev => [{
        recipientEmail: email,
        alias,
        timestamp: Date.now(),
        notes: '',
        username
      }, ...prev]);
    }

    setReverseAlias(alias);
    navigator.clipboard.writeText(alias);
    showNotification("Copied!", event?.nativeEvent);
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

  // --- Map data to generic ListItem format ---

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
            <ReverseAliasSteps>
              <li>Enter recipient's email & click <strong>Convert</strong></li>
              <li>Paste the result as <strong>To</strong> in your email client</li>
              <li>Send from the email linked to your DDG account</li>
            </ReverseAliasSteps>
            <ReverseAliasInputRow>
              <ReverseAliasInput
                type="email"
                placeholder="someone@email.com"
                value={recipientEmail}
                onChange={(e) => {
                  setRecipientEmail(e.target.value);
                  setReverseAlias(null);
                }}
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
            {reverseAlias && (
              <ReverseAliasResult
                onClick={(e) => {
                  navigator.clipboard.writeText(reverseAlias);
                  showNotification("Copied!", e.nativeEvent);
                }}
                title="Click to copy"
              >
                {reverseAlias}
              </ReverseAliasResult>
            )}
          </ReverseAliasSection>
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
