import { useState, useRef, useEffect, useCallback } from "react";
import styled from "styled-components";
import { MdFileUpload, MdArrowBack, MdDescription, MdSecurity, MdDownload, MdContentPaste, MdSync, MdRefresh, MdWarning } from "react-icons/md";
import { DuckService } from "../services/DuckService";
import { SyncService } from "../services/SyncService";
import { usePermissions, PERMISSIONS, ALL_PERMISSIONS } from "../context/PermissionContext";
import { PermissionToggle } from "../components/PermissionToggle";
import { useNotification } from "../components/Notification";

declare const browser: typeof chrome;
const api = typeof browser !== 'undefined' ? browser : chrome;
const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

const Container = styled.div`
  padding: 16px 20px;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  color: ${props => props.theme.primary};

  h2 {
    font-size: 18px;
    margin: 0;
    color: ${props => props.theme.text};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const ExperimentalBadge = styled.span`
  background-color: #ff9f1920;
  color: #ff9f19;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 8px;
`;

const WarningIcon = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  cursor: help;
  
  svg {
    color: #ff9f19;
  }
`;

const WarningTooltip = styled.div`
  position: absolute;
  width: 200px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  border: 1px solid ${props => props.theme.border};
  z-index: 100;
  line-height: 1.4;
  left: 24px;
  top: -5px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  ${WarningIcon}:hover & {
    opacity: 1;
    visibility: visible;
  }
`;

const SyncToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
`;

const SyncToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${props => props.theme.primary};
  }

  &:checked + span:before {
    transform: translateX(24px);
  }

  &:disabled + span {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SyncToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.border};
  transition: background-color 0.4s ease;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: transform 0.4s ease;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const SyncStatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background-color: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
`;

const SyncStatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: ${props => props.theme.textSecondary};
  
  strong {
    color: ${props => props.theme.text};
    margin-right: 8px;
  }
`;

const SyncStatValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RefreshIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  color: ${props => props.theme.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.theme.primary}20;
    color: ${props => props.theme.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    transition: transform 0.5s ease;
  }

  &:active:not(:disabled) svg {
    transform: rotate(360deg);
  }
`;

const ExportButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  width: 100%;
`;

const BackupButtonsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
  width: 100%;
`;

const BackupButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.text};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 8px;
  cursor: pointer;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  justify-content: center;
  min-width: 0;

  &:hover {
    background-color: ${(props) => props.theme.hover};
  }

  svg {
    color: ${(props) => props.theme.primary};
    min-width: 20px;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.primary};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  margin-bottom: 16px;
`;

const VersionInfo = styled.div`
  margin-top: 32px;
  text-align: center;
  font-size: 14px;
  color: ${(props) => props.theme.textSecondary};
`;

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
  const { showNotification, NotificationRenderer } = useNotification();
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
          showNotification(result.message);
          
          const stats = await syncService.getSyncStats();
          setSyncStats(stats);
        } else {
          await syncService.setSyncEnabled(false);
          showNotification(`Sync failed: ${result.message}`);
        }
      } else {
        await syncService.setSyncEnabled(false);
        setSyncEnabled(false);
        setSyncStats(null);
        showNotification('Sync disabled');
      }
    } catch (error: any) {
      showNotification(`Sync error: ${error.message || 'Unknown error'}`);
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
        showNotification(result.message);
        
        const stats = await syncService.getSyncStats();
        setSyncStats(stats);
        
        window.dispatchEvent(new Event('addressesUpdated'));
      } else {
        showNotification(`Sync refresh failed: ${result.message}`);
      }
    } catch (error: any) {
      showNotification(`Sync refresh error: ${error.message || 'Unknown error'}`);
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
      showNotification('This permission is required and cannot be changed');
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
          showNotification(`Context menu ${enabled ? 'enabled' : 'disabled'}. Extension will reload to apply changes.`);
        } else {
          showNotification(`Failed to ${enabled ? 'enable' : 'disable'} context menu`);
        }
      }
    } catch (error) {
      showNotification(`An error occurred while ${enabled ? 'enabling' : 'disabling'} the feature`);
    } finally {
      setLoading(prev => ({ ...prev, [permission]: false }));
    }
  }, [showNotification]);

  const handleExportAddressesJSON = async () => {
    try {
      setLoading(prev => ({ ...prev, export: true }));
      
      const addresses = await duckService.getAddresses();
      
      if (!addresses || addresses.length === 0) {
        showNotification("No addresses to export");
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
      showNotification("Failed to export addresses");
    } finally {
      setLoading(prev => ({ ...prev, export: false }));
    }
  };

  const handleExportAddressesCSV = async () => {
    try {
      setLoading(prev => ({ ...prev, exportCSV: true }));
      
      const addresses = await duckService.getAddresses();
      
      if (!addresses || addresses.length === 0) {
        showNotification("No addresses to export");
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
      showNotification("Failed to export addresses as CSV");
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
        showNotification(`Successfully imported ${result.count} addresses`);
      } else {
        setImportResult(`Import failed: ${result.error || 'Unknown error'}`);
        showNotification(`Import failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setImportResult("Import failed, invalid file");
      showNotification("Import failed, invalid file");
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
      showNotification("No valid data found in clipboard");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, import: true }));
      const result = await duckService.importAddresses(text);
      
      if (result.success) {
        setImportResult(`Successfully imported ${result.count} addresses`);
        showNotification(`Successfully imported ${result.count} addresses`);
      } else {
        setImportResult(`Import failed: ${result.error || 'Unknown error'}`);
        showNotification(`Import failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setImportResult("Import failed, invalid data");
      showNotification("Import failed, invalid data");
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
    <Container>
      {onBack && (
        <BackButton onClick={onBack}>
          <MdArrowBack size={20} />
          Back to Dashboard
        </BackButton>
      )}
      <Section>
        <SectionHeader>
          <h2><MdSecurity size={20} style={{ marginRight: '8px', color: '#ff9f19' }} />Permissions</h2>
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
            <MdSync size={20} style={{ marginRight: '8px', color: '#ff9f19' }} />
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
                  title="Refresh from cloud"
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
          <h2><MdDescription size={20} style={{ marginRight: '8px', color: '#ff9f19' }} />Backup & Restore</h2>
        </SectionHeader>
        
        <ExportButtonsContainer>
          <BackupButton 
            onClick={handleExportAddressesJSON}
            disabled={loading.export}
          >
            <MdDownload size={20} style={{ color: '#ff9f19' }} />
            {loading.export ? 'Exporting...' : 'Export as JSON'}
          </BackupButton>
          <BackupButton 
            onClick={handleExportAddressesCSV}
            disabled={loading.exportCSV}
          >
            <MdDownload size={20} style={{ color: '#ff9f19' }} />
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
                <MdContentPaste size={20} style={{ color: '#ff9f19' }} />
                {loading.import ? 'Importing...' : 'Press Ctrl+V to paste exported file'}
              </>
            ) : (
              <>
                <MdFileUpload size={20} style={{ color: '#ff9f19' }} />
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
      <VersionInfo>
        Qwacky v1.2.1
      </VersionInfo>
      <NotificationRenderer />
    </Container>
  );
};