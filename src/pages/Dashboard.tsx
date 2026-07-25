import { useState, useEffect, useCallback, useMemo } from "react";
import { MdInfo, MdOpenInNew, MdKeyboardArrowDown, MdClose, MdCheck } from "react-icons/md";
import { useApp } from "../context/AppContext";
import { DuckService } from "../services/DuckService";
import { StorageService } from "../services/StorageService";
import { ReverseAlias, TimeFormat } from "../types";
import { useNotification } from "../components/Notification";
import { RichText, useI18n } from "../i18n";

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
  tags?: string[];
}

export const Dashboard = () => {
  const { userData, currentAccount } = useApp();
  const { t, localeTag } = useI18n();
  const [addresses, setAddresses] = useState<StoredAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoEditAddress, setAutoEditAddress] = useState<string | null>(null);
  const [autoEditAlias, setAutoEditAlias] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'send'>('generate');
  const [recipientEmail, setRecipientEmail] = useState("");
  const [reverseAliases, setReverseAliases] = useState<ReverseAlias[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedSender, setSelectedSender] = useState<string | null>(null);
  const [showAliasPicker, setShowAliasPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const duckService = useMemo(() => new DuckService(), []);
  const storageService = useMemo(() => new StorageService(), []);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('12h');
  const { showNotification, NotificationRenderer } = useNotification();

  const generateListConfig: ListConfig = useMemo(() => ({
    title: t("list.generated.title"),
    itemsLabel: t("list.generated.itemsLabel"),
    emptyTitle: t("list.generated.emptyTitle"),
    emptySubtitle: t("list.generated.emptySubtitle"),
    searchPlaceholder: t("list.generated.searchPlaceholder"),
    deleteTitle: t("list.generated.deleteTitle"),
    getDeleteMessage: (key) => t("list.generated.deleteMessage", { key }),
    clearTitle: t("list.generated.clearTitle"),
    clearMessage: t("list.generated.clearMessage"),
    hideStorageKey: "hide_generated_addresses",
  }), [t]);

  const sendListConfig: ListConfig = useMemo(() => ({
    title: t("list.send.title"),
    itemsLabel: t("list.send.itemsLabel"),
    emptyTitle: t("list.send.emptyTitle"),
    emptySubtitle: t("list.send.emptySubtitle"),
    searchPlaceholder: t("list.send.searchPlaceholder"),
    deleteTitle: t("list.send.deleteTitle"),
    getDeleteMessage: (key) => t("list.send.deleteMessage", { key }),
    clearTitle: t("list.send.clearTitle"),
    clearMessage: t("list.send.clearMessage"),
    hideStorageKey: "hide_reverse_aliases",
  }), [t]);

  useEffect(() => {
    chrome.storage.local.get('dashboardActiveTab', (result) => {
      if (chrome.runtime.lastError) return;
      if (result.dashboardActiveTab === 'generate' || result.dashboardActiveTab === 'send') {
        setActiveTab(result.dashboardActiveTab);
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ dashboardActiveTab: activeTab });
  }, [activeTab]);

  useEffect(() => {
    storageService.getTimeFormat().then(setTimeFormat);
  }, [storageService]);

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
          showNotification(t("dashboard.loadFailed"));
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

  const copyToClipboard = useCallback(async (text: string, event?: MouseEvent) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification(t("common.copied"), event);
    } catch {
      showNotification(t("common.failedToCopy"), event);
    }
  }, [showNotification]);

  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString(localeTag, {
      hour: "numeric",
      minute: "numeric",
      hour12: timeFormat === '12h',
      month: "short",
      day: "numeric",
    });
  }, [timeFormat, localeTag]);

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
      showNotification(t("dashboard.generateFailed"));
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

  const handleUpdateAddressTags = async (key: string, tags: string[]) => {
    const success = await duckService.updateAddressTags(key, tags);
    if (success) {
      setAddresses(prev => prev.map(addr =>
        addr.value === key ? { ...addr, tags } : addr
      ));
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

  const handleConvertReverseAlias = async (event?: React.MouseEvent | React.KeyboardEvent) => {
    const email = recipientEmail.trim();
    if (!email || !email.includes("@") || !email.includes(".")) return;
    if (!userData) return;
    const senderLocal = effectiveSender || userData.user.username;
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

    try { await navigator.clipboard.writeText(alias); } catch {}
    const nativeEvent = event && 'clientX' in event.nativeEvent ? event.nativeEvent as MouseEvent : undefined;
    showNotification(t("common.copied"), nativeEvent);
    setRecipientEmail("");
    setAutoEditAlias(email);
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

  const handleUpdateReverseAliasTags = async (key: string, tags: string[]) => {
    const success = await duckService.updateReverseAliasTags(key, tags);
    if (success) {
      setReverseAliases(prev => prev.map(a =>
        a.recipientEmail === key ? { ...a, tags } : a
      ));
    }
  };

  const handleClearAllReverseAliases = async () => {
    const success = await duckService.clearAllReverseAliases();
    if (success) {
      setReverseAliases([]);
    }
  };

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    addresses.forEach(addr => (addr.tags || []).forEach(t => tagSet.add(t)));
    reverseAliases.forEach(a => (a.tags || []).forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [addresses, reverseAliases]);

  const addressItems: ListItem[] = useMemo(() =>
    addresses.map(addr => ({
      key: addr.value,
      primaryText: addr.value + "@duck.com",
      copyText: addr.value + "@duck.com",
      copyLabel: t("list.copyItem", { value: addr.value + "@duck.com" }),
      timestamp: addr.timestamp,
      notes: addr.notes,
      tags: addr.tags || [],
    })),
    [addresses, t]
  );

  const reverseAliasItems: ListItem[] = useMemo(() =>
    reverseAliases.map(a => ({
      key: a.recipientEmail,
      primaryText: a.recipientEmail,
      secondaryText: a.alias,
      copyText: a.alias,
      copyLabel: t("list.copyReverseAlias", { value: a.recipientEmail }),
      timestamp: a.timestamp,
      notes: a.notes,
      tags: a.tags || [],
    })),
    [reverseAliases, t]
  );

  if (!userData) return null;

  return (
    <DashboardContainer>
      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'generate' && (
        <>
          <GenerateButton onClick={generateNewAddress} disabled={loading}>
            {loading ? t("dashboard.generating") : t("dashboard.generate")}
          </GenerateButton>
          <ItemListSection
            items={addressItems}
            config={generateListConfig}
            copyToClipboard={copyToClipboard}
            formatTime={formatTime}
            onUpdateNotes={handleUpdateAddressNotes}
            onDeleteItem={handleDeleteAddress}
            onClearAll={handleClearAllAddresses}
            autoEditKey={autoEditAddress}
            onAutoEditComplete={() => setAutoEditAddress(null)}
            onUpdateTags={handleUpdateAddressTags}
            allTags={allTags}
          />
        </>
      )}

      {activeTab === 'send' && (
        <>
          <ReverseAliasSection>
            <InstructionsToggle onClick={() => setShowInstructions(prev => !prev)}>
              <MdInfo size={14} />
              {showInstructions ? t('dashboard.hideInstructions') : t('dashboard.howToUse')}
            </InstructionsToggle>

            {showInstructions && (
              <>
                <ReverseAliasSteps>
                  <li><RichText text={t('dashboard.step1')} /></li>
                  <li><RichText text={t('dashboard.step2')} /></li>
                  <li><RichText text={t('dashboard.step3')} /></li>
                </ReverseAliasSteps>
                <LearnMoreLink
                  href="https://duckduckgo.com/duckduckgo-help-pages/email-protection/duck-addresses/how-do-i-compose-a-new-email"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('dashboard.learnMore')} <MdOpenInNew size={12} />
                </LearnMoreLink>
              </>
            )}

            {addresses.length > 0 && (
              <SenderSelector onClick={() => { setShowAliasPicker(true); setPickerSearch(''); }}>
                <span>{t('dashboard.from')}</span>
                <span>{(effectiveSender || userData?.user.username) + '@duck.com'}</span>
                <MdKeyboardArrowDown size={18} />
              </SenderSelector>
            )}

            <ReverseAliasInputRow>
              <ReverseAliasInput
                type="email"
                placeholder={t('dashboard.recipientPlaceholder')}
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConvertReverseAlias(e);
                }}
              />
              <ReverseAliasConvertButton
                onClick={handleConvertReverseAlias}
                disabled={!recipientEmail.trim().includes("@")}
              >
                {t('dashboard.convert')}
              </ReverseAliasConvertButton>
            </ReverseAliasInputRow>
          </ReverseAliasSection>

          {showAliasPicker && (
            <DialogOverlay onClick={(e) => { if (e.target === e.currentTarget) { setShowAliasPicker(false); setPickerSearch(''); } }}>
              <PickerContainer>
                <PickerHeader>
                  <h3>{t('dashboard.sendFrom')}</h3>
                  <button aria-label={t('dashboard.closePicker')} onClick={() => { setShowAliasPicker(false); setPickerSearch(''); }}>
                    <MdClose size={20} />
                  </button>
                </PickerHeader>
                <PickerSearchInput
                  placeholder={t('dashboard.searchAddresses')}
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
                      {userData?.user.username}@duck.com
                      {!effectiveSender && <MdCheck size={14} style={{ marginLeft: 6, verticalAlign: 'middle' }} />}
                    </PickerItemText>
                    <PickerItemLabel>{t('dashboard.personalAddress')}</PickerItemLabel>
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
            config={sendListConfig}
            copyToClipboard={copyToClipboard}
            formatTime={formatTime}
            onUpdateNotes={handleUpdateReverseAliasNotes}
            onDeleteItem={handleDeleteReverseAlias}
            onClearAll={handleClearAllReverseAliases}
            autoEditKey={autoEditAlias}
            onAutoEditComplete={() => setAutoEditAlias(null)}
            onUpdateTags={handleUpdateReverseAliasTags}
            allTags={allTags}
          />
        </>
      )}

      <NotificationRenderer />
    </DashboardContainer>
  );
};
