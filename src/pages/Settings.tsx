import { useState, useRef, useEffect, useCallback } from "react";
import { MdFileUpload, MdArrowBack, MdDescription, MdSecurity, MdDownload, MdContentPaste, MdSync, MdRefresh, MdWarning } from "react-icons/md";
import { DuckService } from "../services/DuckService";
import { SyncService } from "../services/SyncService";
import { usePermissions, PERMISSIONS, ALL_PERMISSIONS } from "../context/PermissionContext";
import { PermissionToggle } from "../components/PermissionToggle";
import { Section, SectionHeader, BackButton } from "../styles/SharedStyles";
import {
  SettingsContainer,
  ExperimentalBadge,
  WarningIcon,
  WarningTooltip,
  SyncToggleSwitch,
  SyncToggleInput,
  SyncToggleSlider,
  SyncStatsContainer,
  SyncStatRow,
  SyncStatValue,
  RefreshIconButton,
  ExportButtonsContainer,
  BackupButtonsContainer,
  BackupButton,
  HiddenFileInput,
} from "../styles/pages.styles";

declare const browser: typeof chrome;
const api = typeof browser !== 'undefined' ? browser : chrome;
const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

interface SettingsProps {
  onBack?: () => void;
}

export const Settings = ({ onBack }: SettingsProps) => {
  const [importResult, setImportResult] = useState<string | null>(null);
  const { hasPermissions } = usePermissions();
  const [permissionState, setPermissionState] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const duckService = new DuckService();
  const syncService = new SyncService();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncStats, setSyncStats] = useState<{
    lastSync: number | null;
    bytesInUse: number;
    quotaBytes: number;
    percentUsed: number;
  } | null>(null);

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
      const enabled = await syncService.isSyncEnabled();
      setSyncEnabled(enabled);

      if (enabled) {
        const stats = await syncService.getSyncStats();
        setSyncStats(stats);
      }
    };

    loadSyncState();
  }, []);

  const handleSyncToggle = async (enabled: boolean) => {
    try {
      setLoading(prev => ({ ...prev, sync: true }));

      if (enabled) {
        await syncService.setSyncEnabled(true);
        const result = await syncService.migrateToSync();

        if (result.success) {
          setSyncEnabled(true);

          const stats = await syncService.getSyncStats();
          setSyncStats(stats);
        } else {
          await syncService.setSyncEnabled(false);
        }
      } else {
        await syncService.setSyncEnabled(false);
        setSyncEnabled(false);
        setSyncStats(null);
      }
    } catch (error: any) {
      await syncService.setSyncEnabled(false);
      setSyncEnabled(false);
    } finally {
      setLoading(prev => ({ ...prev, sync: false }));
    }
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

  const handleExportAddressesJSON = async () => {
    try {
      setLoading(prev => ({ ...prev, export: true }));

      const addresses = await duckService.getAddresses();

      if (!addresses || addresses.length === 0) {
        setLoading(prev => ({ ...prev, export: false }));
        return;
      }

      const exportData = await duckService.exportAddresses();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportData);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "qwacky_addresses.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

    } catch (error) {
      console.error("Failed to export addresses:", error);
    } finally {
      setLoading(prev => ({ ...prev, export: false }));
    }
  };

  const handleExportAddressesCSV = async () => {
    try {
      setLoading(prev => ({ ...prev, exportCSV: true }));

      const addresses = await duckService.getAddresses();

      if (!addresses || addresses.length === 0) {
        setLoading(prev => ({ ...prev, exportCSV: false }));
        return;
      }

      const csvData = await duckService.exportAddressesCSV();
      const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvData);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "qwacky_addresses.csv");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

    } catch (error) {
      console.error("Failed to export addresses as CSV:", error);
    } finally {
      setLoading(prev => ({ ...prev, exportCSV: false }));
    }
  };

  const handleImportAddresses = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(prev => ({ ...prev, import: true }));
      const text = await file.text();

      const result = await duckService.importAddresses(text);

      if (result.success) {
        setImportResult(`Successfully imported ${result.count} addresses`);
      } else {
        setImportResult(`Import failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setImportResult("Import failed, invalid file");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setLoading(prev => ({ ...prev, import: false }));
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePaste = async (e: ClipboardEvent) => {
    e.preventDefault();

    const items = Array.from(e.clipboardData?.items || []);
    let text = '';

    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file?.name.match(/\.(json|csv)$/i)) {
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

    try {
      setLoading(prev => ({ ...prev, import: true }));
      const result = await duckService.importAddresses(text);

      if (result.success) {
        setImportResult(`Successfully imported ${result.count} addresses`);
      } else {
        setImportResult(`Import failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setImportResult("Import failed, invalid data");
    } finally {
      setLoading(prev => ({ ...prev, import: false }));
    }
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
            <WarningIcon>
              <MdWarning size={16} />
              <WarningTooltip>
                This is currently an experimental feature. Make sure to backup your current addresses in case of data loss!
              </WarningTooltip>
            </WarningIcon>
            <ExperimentalBadge>EXPERIMENTAL</ExperimentalBadge>
          </h2>
          <SyncToggleSwitch>
            <SyncToggleInput
              type="checkbox"
              checked={syncEnabled}
              onChange={(e) => handleSyncToggle(e.target.checked)}
              disabled={loading.sync}
            />
            <SyncToggleSlider />
          </SyncToggleSwitch>
        </SectionHeader>

        {syncEnabled && syncStats && (
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
      </Section>

      <Section>
        <SectionHeader>
          <h2><MdDescription size={20} style={{ marginRight: '8px' }} />Backup & Restore</h2>
        </SectionHeader>

        <ExportButtonsContainer>
          <BackupButton
            onClick={handleExportAddressesJSON}
            disabled={loading.export}
          >
            <MdDownload size={20} />
            {loading.export ? 'Exporting...' : 'Export as JSON'}
          </BackupButton>
          <BackupButton
            onClick={handleExportAddressesCSV}
            disabled={loading.exportCSV}
          >
            <MdDownload size={20} />
            {loading.exportCSV ? 'Exporting...' : 'Export as CSV'}
          </BackupButton>
        </ExportButtonsContainer>
        <BackupButtonsContainer>
          <BackupButton
            onClick={isFirefox ? undefined : handleImportClick}
            disabled={loading.import}
            style={isFirefox ? { cursor: 'default', opacity: '0.9' } : undefined}
          >
            {isFirefox ? (
              <>
                <MdContentPaste size={20} />
                {loading.import ? 'Importing...' : 'Press Ctrl+V to paste exported file'}
              </>
            ) : (
              <>
                <MdFileUpload size={20} />
                {loading.import ? 'Importing...' : 'Import Addresses (JSON or CSV)'}
              </>
            )}
          </BackupButton>
        </BackupButtonsContainer>
        {importResult && (
          <div style={{ marginTop: '16px', fontSize: '14px' }}>
            {importResult}
          </div>
        )}
        <HiddenFileInput
          type="file"
          ref={fileInputRef}
          accept=".json,.csv"
          onChange={handleImportAddresses}
        />
      </Section>
    </SettingsContainer>
  );
};
