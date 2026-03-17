import { useState, useRef, useEffect, useCallback } from "react";
import { MdFileUpload, MdArrowBack, MdDescription, MdSecurity, MdDownload, MdSync, MdRefresh, MdKeyboardArrowDown } from "react-icons/md";
import { DuckService } from "../services/DuckService";
import { SyncService, SyncOptions } from "../services/SyncService";
import { usePermissions, PERMISSIONS, ALL_PERMISSIONS } from "../context/PermissionContext";
import { useApp } from "../context/AppContext";
import { BackupSummary } from "../types";
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

interface SettingsProps {
  onBack?: () => void;
}

export const Settings = ({ onBack }: SettingsProps) => {
  const [importResult, setImportResult] = useState<string | null>(null);
  const { hasPermissions } = usePermissions();
  const { accounts, currentAccount } = useApp();
  const [permissionState, setPermissionState] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importingRef = useRef(false);
  const duckService = new DuckService();
  const syncService = new SyncService();
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
    if (selectedAccounts.length === 0) return 'Select accounts...';
    if (selectedAccounts.length === accounts.length) return 'All accounts';
    if (selectedAccounts.length === 1) return `${selectedAccounts[0]}@duck.com`;
    return `${selectedAccounts.length} accounts selected`;
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
        setImportResult('Sync was automatically disabled because storage quota was exceeded.');
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
    if (syncOptions.syncAccounts.length === 0) return 'All accounts';
    if (syncOptions.syncAccounts.length === 1) return `${syncOptions.syncAccounts[0]}@duck.com`;
    return `${syncOptions.syncAccounts.length} accounts selected`;
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
      lines.push(`Accounts: ${s.accounts.map(a => a.username + '@duck.com').join(', ')}`);
      lines.push(`Addresses: ${s.totalAddresses}`);
      lines.push(`Reverse aliases: ${s.totalReverseAliases}`);
      if (s.includesSession) lines.push(`Session data: included`);
    } else {
      if (s.newAccounts && s.newAccounts > 0) {
        lines.push(`New accounts added: ${s.newAccounts}`);
      }
      for (const a of s.accounts) {
        const parts: string[] = [];
        if (a.addresses > 0) parts.push(`${a.addresses} addresses`);
        if (a.reverseAliases > 0) parts.push(`${a.reverseAliases} reverse aliases`);
        if (parts.length > 0) {
          lines.push(`${a.username}@duck.com: +${parts.join(', ')}`);
        }
      }
      if ((s.skippedAddresses || 0) > 0 || (s.skippedReverseAliases || 0) > 0) {
        const skipped: string[] = [];
        if (s.skippedAddresses) skipped.push(`${s.skippedAddresses} addresses`);
        if (s.skippedReverseAliases) skipped.push(`${s.skippedReverseAliases} reverse aliases`);
        lines.push(`Skipped (already exist): ${skipped.join(', ')}`);
      }
      if (s.newAddresses === 0 && s.newReverseAliases === 0 && (!s.newAccounts || s.newAccounts === 0)) {
        lines.push('Everything was already up to date.');
      }
      if (s.includesSession) lines.push(`Session data: restored`);
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
      setImportResult("Failed to export backup");
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
      setImportResult("Import failed, invalid file");
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
          setImportResult(`Import failed: ${result.error || 'Unknown error'}`);
        }
        setLoading(prev => ({ ...prev, import: false }));
        return;
      }

      if (parsed.addresses && Array.isArray(parsed.addresses)) {
        setLoading(prev => ({ ...prev, import: true }));
        const result = await duckService.importAddresses(text);
        if (result.success) {
          setImportResult(`Successfully imported ${result.count} addresses`);
        } else {
          setImportResult(`Import failed: ${result.error || 'Unknown error'}`);
        }
        setLoading(prev => ({ ...prev, import: false }));
        return;
      }

      setImportResult("Unrecognized file format");
    } catch {
      setImportResult("Import failed, invalid file");
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
        setImportResult(`Import failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setImportResult("Import failed");
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
          Back to Dashboard
        </BackButton>
      )}
      <Section>
        <SectionHeader>
          <h2><MdSecurity size={20} style={{ marginRight: '8px' }} />Permissions & Features</h2>
        </SectionHeader>
        {ALL_PERMISSIONS.map(permission => (
          <PermissionToggle
            key={permission}
            name={PERMISSIONS[permission].name}
            description={PERMISSIONS[permission].description}
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
            Sync
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
                          <SyncOptionHint>(current)</SyncOptionHint>
                        )}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                )}
              </DropdownWrapper>
            )}

            <SyncOptionsContainer>
              <SyncOptionsTitle>Sync Options</SyncOptionsTitle>
              <SyncOptionRow>
                <SyncToggleSwitch>
                  <SyncToggleInput
                    type="checkbox"
                    checked={syncOptions.addresses}
                    onChange={(e) => handleSyncOptionChange('addresses', e.target.checked)}
                  />
                  <SyncToggleSlider />
                </SyncToggleSwitch>
                Addresses
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
                Reverse Aliases
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
                Session Data
                <SyncOptionHint>(login data & settings)</SyncOptionHint>
              </SyncOptionRow>
              {syncOptions.session && (
                <div style={{ marginLeft: '56px', marginTop: '4px', fontSize: '12px', color: '#ff9f19' }}>
                  Session data includes your access tokens. They are encrypted by Chrome during sync but stored in your Google account.
                </div>
              )}
            </SyncOptionsContainer>

            {syncStats && (
              <SyncStatsContainer>
                <SyncStatRow>
                  <div>
                    <strong>Status:</strong> {syncStats.lastSync ? `Last synced ${new Date(syncStats.lastSync).toLocaleString()}` : 'Never synced'}
                  </div>
                  <SyncStatValue>
                    <RefreshIconButton
                      onClick={handleRefreshSync}
                      disabled={loading.refreshSync}
                      title="Refresh"
                    >
                      <MdRefresh size={16} />
                    </RefreshIconButton>
                  </SyncStatValue>
                </SyncStatRow>
                <SyncStatRow>
                  <div>
                    <strong>Storage used:</strong> {(syncStats.bytesInUse / 1024).toFixed(2)} KB / {(syncStats.quotaBytes / 1024).toFixed(0)} KB ({syncStats.percentUsed.toFixed(1)}%)
                  </div>
                </SyncStatRow>
              </SyncStatsContainer>
            )}
          </>
        )}
      </Section>

      <Section>
        <SectionHeader>
          <h2><MdDescription size={20} style={{ marginRight: '8px' }} />Backup & Restore</h2>
        </SectionHeader>

        <ExportButtonsContainer>
          <BackupButton
            onClick={handleExport}
            disabled={loading.export || selectedAccounts.length === 0}
          >
            <MdDownload size={20} />
            {loading.export ? 'Exporting...' : 'Export Backup'}
          </BackupButton>
          <BackupButton
            onClick={isFirefoxPopup ? () => setShowPopoutPrompt(true) : handleImportClick}
            disabled={loading.import}
          >
            <MdFileUpload size={20} />
            {loading.import ? 'Importing...' : 'Import Backup'}
          </BackupButton>
        </ExportButtonsContainer>

        <ExportOptionsContainer>
          <ExportOptionsTitle>Export Options</ExportOptionsTitle>

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
                        <ExportOptionHint>(current)</ExportOptionHint>
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
            Include session
            <ExportOptionHint>(login data & settings)</ExportOptionHint>
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
          accept=".json"
          onChange={handleImportFile}
        />
      </Section>

      <ConfirmDialog
        isOpen={showPopoutPrompt}
        variant="info"
        title="Open in New Window"
        message="Firefox doesn't allow file selection from the popup. The extension will open in a new window where you can import your backup normally."
        confirmLabel="Open Window"
        cancelLabel="Cancel"
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
        title="Security Warning"
        message="The exported file will contain your access token and login credentials. Keep this file secure and do not share it. Anyone with this file can access your DuckDuckGo Email account."
        confirmLabel="Export Anyway"
        cancelLabel="Cancel"
        onConfirm={() => {
          setShowExportWarning(false);
          doExport();
        }}
        onCancel={() => setShowExportWarning(false)}
      />

      <ConfirmDialog
        isOpen={showImportConfirm}
        variant="warning"
        title="Import Backup"
        message="This backup contains session data. Importing it will add the accounts and their data to your extension. Are you sure?"
        confirmLabel="Import"
        cancelLabel="Cancel"
        onConfirm={handleImportConfirmed}
        onCancel={() => {
          setShowImportConfirm(false);
          setPendingImportData(null);
        }}
      />

      <ConfirmDialog
        isOpen={backupSummary !== null}
        variant="info"
        title={backupSummary?.action === 'export' ? 'Export Complete' : 'Import Complete'}
        message={backupSummary ? buildSummaryMessage(backupSummary) : ''}
        confirmLabel="Close"
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
