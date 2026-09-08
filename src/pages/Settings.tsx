import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { MdFileUpload, MdArrowBack, MdDescription, MdSecurity, MdDownload, MdSync, MdRefresh, MdKeyboardArrowDown, MdPalette, MdLightMode, MdDarkMode, MdDevices, MdTranslate } from "react-icons/md";
import { DuckService } from "../services/DuckService";
import { StorageService } from "../services/StorageService";
import { SyncService, SyncOptions } from "../services/SyncService";
import { ImportAddressesResult } from "../services/ImportExportService";
import { usePermissions, PERMISSIONS, ALL_PERMISSIONS } from "../context/PermissionContext";
import { useApp, ThemeMode } from "../context/AppContext";
import { Language, TranslateParams, TranslationKey, useI18n } from "../i18n";
import { BackupSummary, TimeFormat } from "../types";
import { PermissionToggle } from "../components/PermissionToggle";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Section, SectionHeader, BackButton } from "../styles/SharedStyles";
import {
  SettingsContainer,
  SyncToggleSwitch,
  SyncToggleInput,
  SyncToggleSlider,
  SyncStatsContainer,
  SyncStatRow,
  SyncStatValue,
  RefreshIconButton,
  SyncOptionsContainer,
  SyncOptionsTitle,
  SyncOptionRow,
  SyncOptionHint,
  ThemeOptionLabel,
  ThemeOptionGroup,
  ThemeOptionButton,
  ExportButtonsContainer,
  BackupButton,
  HiddenFileInput,
  ExportOptionsContainer,
  ExportOptionsTitle,
  ExportOptionRow,
  ExportOptionHint,
  DropdownWrapper,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "../styles/pages.styles";

declare const browser: typeof chrome;
const api = typeof browser !== 'undefined' ? browser : chrome;
const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
const isFirefoxPopup = isFirefox && !window.location.search.includes('popout=1');

type Translate = (key: TranslationKey, params?: TranslateParams) => string;

const describeAddressImport = (result: ImportAddressesResult, t: Translate): string => {
  if (!result.success) {
    return t('settings.importFailedWithReason', { reason: result.error || t('common.unknownError') });
  }

  const notes: string[] = [];
  if (result.duplicates > 0) {
    notes.push(t('settings.importDuplicates', { count: result.duplicates }));
  }
  if (result.invalid > 0) notes.push(t('settings.importInvalid', { count: result.invalid }));

  if (result.count === 0) {
    return result.error || t('settings.importNothingNew');
  }

  const imported = t('settings.importedCount', { count: result.count });
  return notes.length > 0
    ? t('settings.importedCountWithNotes', { imported, notes: notes.join(', ') })
    : imported;
};

const THEME_OPTIONS: Array<{ mode: ThemeMode; icon: typeof MdLightMode; labelKey: TranslationKey }> = [
  { mode: 'light', icon: MdLightMode, labelKey: 'settings.themeLight' },
  { mode: 'dark', icon: MdDarkMode, labelKey: 'settings.themeDark' },
  { mode: 'system', icon: MdDevices, labelKey: 'settings.themeSystem' },
];

const LANGUAGE_LABEL_KEYS: Record<Language, TranslationKey> = {
  en: 'language.en',
  es: 'language.es',
};

interface SettingsProps {
  onBack?: () => void;
}

export const Settings = ({ onBack }: SettingsProps) => {
  const [importResult, setImportResult] = useState<string | null>(null);
  const { hasPermissions } = usePermissions();
  const { accounts, currentAccount, themeMode, setThemeMode } = useApp();
  const { t, localeTag, language, languages, setLanguage } = useI18n();
  const formatNumber = useCallback(
    (value: number, digits: number) =>
      value.toLocaleString(localeTag, { minimumFractionDigits: digits, maximumFractionDigits: digits }),
    [localeTag]
  );
  const formatKb = useCallback(
    (bytes: number, digits: number) => formatNumber(bytes / 1024, digits),
    [formatNumber]
  );
  const [permissionState, setPermissionState] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importingRef = useRef(false);
  const duckService = useMemo(() => new DuckService(), []);
  const storageService = useMemo(() => new StorageService(), []);
  const syncService = useMemo(() => new SyncService(), []);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('12h');
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [syncOptions, setSyncOptions] = useState<SyncOptions>({ enabled: false, addresses: true, reverseAliases: true, session: false, syncAccounts: [] });
  const [includeSession, setIncludeSession] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(() =>
    accounts.map(a => a.username)
  );
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [syncAccountDropdownOpen, setSyncAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const syncDropdownRef = useRef<HTMLDivElement>(null);
  const [showExportWarning, setShowExportWarning] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showPopoutPrompt, setShowPopoutPrompt] = useState(false);
  const [backupSummary, setBackupSummary] = useState<BackupSummary | null>(null);
  const [pendingImportData, setPendingImportData] = useState<string | null>(null);
  const [syncStats, setSyncStats] = useState<{
    lastSync: number | null;
    bytesInUse: number;
    quotaBytes: number;
    percentUsed: number;
  } | null>(null);

  useEffect(() => {
    storageService.getTimeFormat().then(setTimeFormat);
  }, [storageService]);

  const handleTimeFormatChange = async (use24h: boolean) => {
    const format: TimeFormat = use24h ? '24h' : '12h';
    setTimeFormat(format);
    await storageService.setTimeFormat(format);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
      if (syncDropdownRef.current && !syncDropdownRef.current.contains(e.target as Node)) {
        setSyncAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleAccount = (username: string) => {
    setSelectedAccounts(prev =>
      prev.includes(username)
        ? prev.filter(u => u !== username)
        : [...prev, username]
    );
  };

  const getDropdownLabel = () => {
    if (selectedAccounts.length === 0) return t('settings.selectAccounts');
    if (selectedAccounts.length === accounts.length) return t('settings.allAccounts');
    if (selectedAccounts.length === 1) return `${selectedAccounts[0]}@duck.com`;
    return t('settings.accountsSelected', { count: selectedAccounts.length });
  };

  useEffect(() => {
    const loadPermissionStates = async () => {
      const states: Record<string, boolean> = {};

      states.storage = true;
      if (isFirefox) {
        states.contextMenu = true;
      }

      try {
        const response = await api.runtime.sendMessage({ action: 'getFeatureState' });
        states.contextMenuFeatures = response?.enabled ?? false;
      } catch (error) {
        states.contextMenuFeatures = false;
      }

      setPermissionState(states);
    };

    loadPermissionStates();

    const timerId = setTimeout(loadPermissionStates, 1500);
    return () => clearTimeout(timerId);
  }, [hasPermissions]);

  useEffect(() => {
    const loadSyncState = async () => {
      const options = await syncService.getSyncOptions();
      setSyncOptions(options);

      if (options.enabled) {
        const stats = await syncService.getSyncStats();
        setSyncStats(stats);
      }
    };

    const handleSyncMessage = (message: any) => {
      if (message.action === 'syncAutoDisabled') {
        setSyncOptions(prev => ({ ...prev, enabled: false }));
        setSyncStats(null);
        setImportResult(t('settings.syncAutoDisabled'));
      }
    };

    loadSyncState();
    chrome.runtime.onMessage.addListener(handleSyncMessage);
    return () => chrome.runtime.onMessage.removeListener(handleSyncMessage);
  }, []);

  const handleSyncToggle = async (enabled: boolean) => {
    try {
      setLoading(prev => ({ ...prev, sync: true }));

      if (enabled) {
        const result = await syncService.setSyncEnabled(true);

        if (result.success) {
          const options = await syncService.getSyncOptions();
          setSyncOptions(options);

          const stats = await syncService.getSyncStats();
          setSyncStats(stats);
        } else {
          await syncService.setSyncEnabled(false);
        }
      } else {
        await syncService.setSyncEnabled(false);
        setSyncOptions(prev => ({ ...prev, enabled: false }));
        setSyncStats(null);
      }
    } catch (error: any) {
      await syncService.setSyncEnabled(false);
      setSyncOptions(prev => ({ ...prev, enabled: false }));
    } finally {
      setLoading(prev => ({ ...prev, sync: false }));
    }
  };

  const handleSyncOptionChange = async (key: keyof SyncOptions, value: boolean) => {
    const updated = { ...syncOptions, [key]: value };
    setSyncOptions(updated);
    await syncService.setSyncOptions({ [key]: value });

    if (value && syncOptions.enabled) {
      await syncService.migrateToSync();
      const stats = await syncService.getSyncStats();
      setSyncStats(stats);
    }
  };

  const handleSyncAccountsChange = async (username: string) => {
    const current = syncOptions.syncAccounts.length === 0 ? accounts.map(a => a.username) : [...syncOptions.syncAccounts];
    const updated = current.includes(username)
      ? current.filter(u => u !== username)
      : [...current, username];
    const finalAccounts = updated.length === accounts.length ? [] : updated;
    setSyncOptions(prev => ({ ...prev, syncAccounts: finalAccounts }));
    await syncService.setSyncOptions({ syncAccounts: finalAccounts });
  };

  const getSyncAccountLabel = () => {
    if (syncOptions.syncAccounts.length === 0) return t('settings.allAccounts');
    if (syncOptions.syncAccounts.length === 1) return `${syncOptions.syncAccounts[0]}@duck.com`;
    return t('settings.accountsSelected', { count: syncOptions.syncAccounts.length });
  };

  const isAccountSyncSelected = (username: string) => {
    return syncOptions.syncAccounts.length === 0 || syncOptions.syncAccounts.includes(username);
  };

  const handleRefreshSync = async () => {
    try {
      setLoading(prev => ({ ...prev, refreshSync: true }));

      const result = await syncService.pullFromSync();

      if (result.success) {
        const stats = await syncService.getSyncStats();
        setSyncStats(stats);

        window.dispatchEvent(new Event('addressesUpdated'));
      }
    } catch (error: any) {
      console.error('Sync refresh error:', error);
    } finally {
      setLoading(prev => ({ ...prev, refreshSync: false }));
    }
  };


  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      const contextMenuKey = 'contextMenuEnabled';
      if (changes[contextMenuKey]) {
        setPermissionState(prev => ({
          ...prev,
          contextMenuFeatures: changes[contextMenuKey].newValue
        }));
      }
    };

    try {
      api.storage.onChanged.addListener(handleStorageChange);
    } catch (error) {
      console.error("Error adding storage change listener:", error);
    }

    return () => {
      try {
        api.storage.onChanged.removeListener(handleStorageChange);
      } catch (error) {
        console.error("Error removing storage change listener:", error);
      }
    };
  }, []);

  const togglePermission = useCallback(async (permission: string, enabled: boolean) => {
    if (PERMISSIONS[permission as keyof typeof PERMISSIONS]?.isRequired) {
      return;
    }

    setLoading(prev => ({ ...prev, [permission]: true }));

    try {
      if (permission === 'contextMenuFeatures') {
        const response = await api.runtime.sendMessage({
          action: 'toggleFeature',
          enabled
        });

        if (response && response.success) {
          setPermissionState(prev => ({
            ...prev,
            [permission]: enabled
          }));
        }
      }
    } catch (error) {
      console.error('Toggle permission error:', error);
    } finally {
      setLoading(prev => ({ ...prev, [permission]: false }));
    }
  }, []);

  const buildSummaryMessage = (s: BackupSummary): React.ReactNode => {
    const lines: string[] = [];

    if (s.action === 'export') {
      lines.push(t('settings.summaryAccounts', { accounts: s.accounts.map(a => a.username + '@duck.com').join(', ') }));
      lines.push(t('settings.summaryAddresses', { count: s.totalAddresses }));
      lines.push(t('settings.summaryReverseAliases', { count: s.totalReverseAliases }));
      if (s.includesSession) lines.push(t('settings.summarySessionIncluded'));
    } else {
      if (s.newAccounts && s.newAccounts > 0) {
        lines.push(t('settings.summaryNewAccounts', { count: s.newAccounts }));
      }
      for (const a of s.accounts) {
        const parts: string[] = [];
        if (a.addresses > 0) parts.push(t('settings.summaryAddressCount', { count: a.addresses }));
        if (a.reverseAliases > 0) parts.push(t('settings.summaryAliasCount', { count: a.reverseAliases }));
        if (parts.length > 0) {
          lines.push(t('settings.summaryAccountLine', { account: a.username, parts: parts.join(', ') }));
        }
      }
      if ((s.skippedAddresses || 0) > 0 || (s.skippedReverseAliases || 0) > 0) {
        const skipped: string[] = [];
        if (s.skippedAddresses) skipped.push(t('settings.summaryAddressCount', { count: s.skippedAddresses }));
        if (s.skippedReverseAliases) skipped.push(t('settings.summaryAliasCount', { count: s.skippedReverseAliases }));
        lines.push(t('settings.summarySkipped', { parts: skipped.join(', ') }));
      }
      if (s.newAddresses === 0 && s.newReverseAliases === 0 && (!s.newAccounts || s.newAccounts === 0)) {
        lines.push(t('settings.summaryUpToDate'));
      }
      if (s.includesSession) lines.push(t('settings.summarySessionRestored'));
    }

    return lines.join('\n');
  };

  const handleExport = async () => {
    if (includeSession) {
      setShowExportWarning(true);
      return;
    }
    await doExport();
  };

  const getDateString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const doExport = async () => {
    try {
      setLoading(prev => ({ ...prev, export: true }));

      const { data, summary } = await duckService.exportBackup(selectedAccounts, includeSession);
      const blob = new Blob([data], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      try {
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", url);
        downloadAnchorNode.setAttribute("download", `qwacky_backup_${getDateString()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      } finally {
        URL.revokeObjectURL(url);
      }
      setBackupSummary(summary);
    } catch (error) {
      console.error("Failed to export backup:", error);
      setImportResult(t('settings.exportFailed'));
    } finally {
      setLoading(prev => ({ ...prev, export: false }));
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await processImport(text);
    } catch (error) {
      setImportResult(t('settings.importFailedInvalidFile'));
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processImport = async (text: string) => {
    if (importingRef.current) return;
    importingRef.current = true;
    try {
      const parsed = JSON.parse(text);

      if (parsed.type === 'qwacky_backup') {
        if (parsed.session) {
          setPendingImportData(text);
          setShowImportConfirm(true);
          return;
        }

        setLoading(prev => ({ ...prev, import: true }));
        const result = await duckService.importBackup(text);
        if (result.success && result.summary) {
          setBackupSummary(result.summary);
        } else {
          setImportResult(t('settings.importFailedWithReason', { reason: result.error || t('common.unknownError') }));
        }
        setLoading(prev => ({ ...prev, import: false }));
        return;
      }

      if (parsed.addresses && Array.isArray(parsed.addresses)) {
        setLoading(prev => ({ ...prev, import: true }));
        const result = await duckService.importAddresses(text);
        setImportResult(describeAddressImport(result, t));
        setLoading(prev => ({ ...prev, import: false }));
        return;
      }

      setImportResult(t('settings.unrecognizedFormat'));
    } catch {
      setLoading(prev => ({ ...prev, import: true }));
      const result = await duckService.importAddressList(text);
      setImportResult(describeAddressImport(result, t));
      setLoading(prev => ({ ...prev, import: false }));
    } finally {
      importingRef.current = false;
    }
  };

  const handleImportConfirmed = async () => {
    setShowImportConfirm(false);
    if (!pendingImportData) return;

    try {
      setLoading(prev => ({ ...prev, import: true }));
      const result = await duckService.importBackup(pendingImportData);

      if (result.success && result.summary) {
        setBackupSummary(result.summary);
      } else if (!result.success) {
        setImportResult(t('settings.importFailedWithReason', { reason: result.error || t('common.unknownError') }));
      }
    } catch (error) {
      setImportResult(t('settings.importFailed'));
    } finally {
      setPendingImportData(null);
      setLoading(prev => ({ ...prev, import: false }));
    }
  };

  const handlePaste = async (e: ClipboardEvent) => {
    e.preventDefault();

    const items = Array.from(e.clipboardData?.items || []);
    let text = '';

    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file?.name.match(/\.json$/i)) {
          try {
            text = await file.text();
            break;
          } catch (error) {
            console.error('Error reading file:', error);
          }
        }
      }
    }

    if (!text) {
      text = e.clipboardData?.getData('text/plain') || '';
    }

    if (!text) {
      return;
    }

    await processImport(text);
  };

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  return (
    <SettingsContainer>
      {onBack && (
        <BackButton onClick={onBack}>
          <MdArrowBack size={20} />
          {t('common.backToDashboard')}
        </BackButton>
      )}
      <Section>
        <SectionHeader>
          <h2><MdPalette size={20} style={{ marginRight: '8px' }} />{t('settings.appearance')}</h2>
        </SectionHeader>
        <ThemeOptionLabel>{t('settings.theme')}</ThemeOptionLabel>
        <ThemeOptionGroup>
          {THEME_OPTIONS.map(({ mode, icon: Icon, labelKey }) => (
            <ThemeOptionButton
              key={mode}
              type="button"
              active={themeMode === mode}
              aria-pressed={themeMode === mode}
              onClick={() => setThemeMode(mode)}
            >
              <Icon size={16} />
              {t(labelKey)}
            </ThemeOptionButton>
          ))}
        </ThemeOptionGroup>
        <ThemeOptionLabel>
          <MdTranslate size={14} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
          {t('settings.language')}
        </ThemeOptionLabel>
        <ThemeOptionGroup>
          {languages.map(code => (
            <ThemeOptionButton
              key={code}
              type="button"
              active={language === code}
              aria-pressed={language === code}
              lang={code}
              onClick={() => setLanguage(code)}
            >
              {t(LANGUAGE_LABEL_KEYS[code])}
            </ThemeOptionButton>
          ))}
        </ThemeOptionGroup>
        <SyncOptionRow>
          <SyncToggleSwitch>
            <SyncToggleInput
              type="checkbox"
              checked={timeFormat === '24h'}
              onChange={(e) => handleTimeFormatChange(e.target.checked)}
            />
            <SyncToggleSlider />
          </SyncToggleSwitch>
          {t('settings.timeFormat24h')}
        </SyncOptionRow>
      </Section>

      <Section>
        <SectionHeader>
          <h2><MdSecurity size={20} style={{ marginRight: '8px' }} />{t('settings.permissions')}</h2>
        </SectionHeader>
        {ALL_PERMISSIONS.map(permission => (
          <PermissionToggle
            key={permission}
            permission={permission}
            isEnabled={permission === 'storage' || permission === 'contextMenu' ? true : permissionState[permission] || false}
            onChange={(enabled) => togglePermission(permission, enabled)}
            disabled={false}
          />
        ))}
      </Section>

      <Section>
        <SectionHeader>
          <h2>
            <MdSync size={20} style={{ marginRight: '8px' }} />
            {t('settings.sync')}
          </h2>
          <SyncToggleSwitch>
            <SyncToggleInput
              type="checkbox"
              checked={syncOptions.enabled}
              onChange={(e) => handleSyncToggle(e.target.checked)}
              disabled={loading.sync}
            />
            <SyncToggleSlider />
          </SyncToggleSwitch>
        </SectionHeader>

        {syncOptions.enabled && (
          <>
            {accounts.length > 1 && (
              <DropdownWrapper ref={syncDropdownRef} style={{ marginBottom: '12px' }}>
                <DropdownTrigger
                  type="button"
                  onClick={() => setSyncAccountDropdownOpen(prev => !prev)}
                  data-open={syncAccountDropdownOpen}
                >
                  {getSyncAccountLabel()}
                  <MdKeyboardArrowDown size={20} />
                </DropdownTrigger>
                {syncAccountDropdownOpen && (
                  <DropdownMenu>
                    {accounts.map(account => (
                      <DropdownItem key={account.username}>
                        <input
                          type="checkbox"
                          checked={isAccountSyncSelected(account.username)}
                          onChange={() => handleSyncAccountsChange(account.username)}
                        />
                        {account.username}@duck.com
                        {account.username === currentAccount && (
                          <SyncOptionHint>{t('common.current')}</SyncOptionHint>
                        )}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                )}
              </DropdownWrapper>
            )}

            <SyncOptionsContainer>
              <SyncOptionsTitle>{t('settings.syncOptions')}</SyncOptionsTitle>
              <SyncOptionRow>
                <SyncToggleSwitch>
                  <SyncToggleInput
                    type="checkbox"
                    checked={syncOptions.addresses}
                    onChange={(e) => handleSyncOptionChange('addresses', e.target.checked)}
                  />
                  <SyncToggleSlider />
                </SyncToggleSwitch>
                {t('settings.syncAddresses')}
              </SyncOptionRow>
              <SyncOptionRow>
                <SyncToggleSwitch>
                  <SyncToggleInput
                    type="checkbox"
                    checked={syncOptions.reverseAliases}
                    onChange={(e) => handleSyncOptionChange('reverseAliases', e.target.checked)}
                  />
                  <SyncToggleSlider />
                </SyncToggleSwitch>
                {t('settings.syncReverseAliases')}
              </SyncOptionRow>
              <SyncOptionRow>
                <SyncToggleSwitch>
                  <SyncToggleInput
                    type="checkbox"
                    checked={syncOptions.session}
                    onChange={(e) => handleSyncOptionChange('session', e.target.checked)}
                  />
                  <SyncToggleSlider />
                </SyncToggleSwitch>
                {t('settings.syncSessionData')}
                <SyncOptionHint>{t('settings.syncSessionHint')}</SyncOptionHint>
              </SyncOptionRow>
              {syncOptions.session && (
                <div style={{ marginLeft: '56px', marginTop: '4px', fontSize: '12px', color: '#ff9f19' }}>
                  {isFirefox
                    ? t('settings.syncTokenWarningFirefox')
                    : t('settings.syncTokenWarningChrome')}
                </div>
              )}
            </SyncOptionsContainer>

            {syncStats && (
              <SyncStatsContainer>
                <SyncStatRow>
                  <div>
                    <strong>{t('settings.syncStatus')}</strong> {syncStats.lastSync ? t('settings.syncLastSynced', { date: new Date(syncStats.lastSync).toLocaleString(localeTag) }) : t('settings.syncNever')}
                  </div>
                  <SyncStatValue>
                    <RefreshIconButton
                      onClick={handleRefreshSync}
                      disabled={loading.refreshSync}
                      title={t('settings.syncRefresh')}
                    >
                      <MdRefresh size={16} />
                    </RefreshIconButton>
                  </SyncStatValue>
                </SyncStatRow>
                <SyncStatRow>
                  <div>
                    <strong>{t('settings.syncStorageUsed')}</strong> {formatKb(syncStats.bytesInUse, 2)} KB / {formatKb(syncStats.quotaBytes, 0)} KB ({formatNumber(syncStats.percentUsed, 1)}%)
                  </div>
                </SyncStatRow>
              </SyncStatsContainer>
            )}
          </>
        )}
      </Section>

      <Section>
        <SectionHeader>
          <h2><MdDescription size={20} style={{ marginRight: '8px' }} />{t('settings.backup')}</h2>
        </SectionHeader>

        <ExportButtonsContainer>
          <BackupButton
            onClick={handleExport}
            disabled={loading.export || selectedAccounts.length === 0}
          >
            <MdDownload size={20} />
            {loading.export ? t('settings.exporting') : t('settings.exportBackup')}
          </BackupButton>
          <BackupButton
            onClick={isFirefoxPopup ? () => setShowPopoutPrompt(true) : handleImportClick}
            disabled={loading.import}
          >
            <MdFileUpload size={20} />
            {loading.import ? t('settings.importing') : t('settings.importBackup')}
          </BackupButton>
        </ExportButtonsContainer>

        <ExportOptionHint style={{ display: 'block', marginBottom: '16px' }}>
          {t('settings.importHint')}
        </ExportOptionHint>

        <ExportOptionsContainer>
          <ExportOptionsTitle>{t('settings.exportOptions')}</ExportOptionsTitle>

          {accounts.length > 1 && (
            <DropdownWrapper ref={dropdownRef}>
              <DropdownTrigger
                type="button"
                onClick={() => setAccountDropdownOpen(prev => !prev)}
                data-open={accountDropdownOpen}
              >
                {getDropdownLabel()}
                <MdKeyboardArrowDown size={20} />
              </DropdownTrigger>
              {accountDropdownOpen && (
                <DropdownMenu>
                  {accounts.map(account => (
                    <DropdownItem key={account.username}>
                      <input
                        type="checkbox"
                        checked={selectedAccounts.includes(account.username)}
                        onChange={() => toggleAccount(account.username)}
                      />
                      {account.username}@duck.com
                      {account.username === currentAccount && (
                        <ExportOptionHint>{t('common.current')}</ExportOptionHint>
                      )}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              )}
            </DropdownWrapper>
          )}

          <ExportOptionRow>
            <SyncToggleSwitch>
              <SyncToggleInput
                type="checkbox"
                checked={includeSession}
                onChange={(e) => setIncludeSession(e.target.checked)}
              />
              <SyncToggleSlider />
            </SyncToggleSwitch>
            {t('settings.includeSession')}
            <ExportOptionHint>{t('settings.syncSessionHint')}</ExportOptionHint>
          </ExportOptionRow>
        </ExportOptionsContainer>

        {importResult && (
          <div style={{ marginTop: '16px', fontSize: '14px' }}>
            {importResult}
          </div>
        )}
        <HiddenFileInput
          type="file"
          ref={fileInputRef}
          accept=".json,.txt"
          onChange={handleImportFile}
        />
      </Section>

      <ConfirmDialog
        isOpen={showPopoutPrompt}
        variant="info"
        title={t('settings.popoutTitle')}
        message={t('settings.popoutMessage')}
        confirmLabel={t('settings.popoutConfirm')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          setShowPopoutPrompt(false);
          chrome.runtime.sendMessage({ action: 'popoutExtension' });
          window.close();
        }}
        onCancel={() => setShowPopoutPrompt(false)}
      />

      <ConfirmDialog
        isOpen={showExportWarning}
        variant="warning"
        title={t('settings.exportWarningTitle')}
        message={t('settings.exportWarningMessage')}
        confirmLabel={t('settings.exportWarningConfirm')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          setShowExportWarning(false);
          doExport();
        }}
        onCancel={() => setShowExportWarning(false)}
      />

      <ConfirmDialog
        isOpen={showImportConfirm}
        variant="warning"
        title={t('settings.importConfirmTitle')}
        message={t('settings.importConfirmMessage')}
        confirmLabel={t('settings.importConfirmButton')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleImportConfirmed}
        onCancel={() => {
          setShowImportConfirm(false);
          setPendingImportData(null);
        }}
      />

      <ConfirmDialog
        isOpen={backupSummary !== null}
        variant="info"
        title={backupSummary?.action === 'export' ? t('settings.exportComplete') : t('settings.importComplete')}
        message={backupSummary ? buildSummaryMessage(backupSummary) : ''}
        confirmLabel={t('common.close')}
        singleButton
        onConfirm={async () => {
          const isImport = backupSummary?.action === 'import';
          setBackupSummary(null);
          if (isImport) {
            await chrome.storage.local.set({ showSettings: false });
            window.location.reload();
          }
        }}
      />
    </SettingsContainer>
  );
};
