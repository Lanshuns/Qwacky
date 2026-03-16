import { StorageService } from './StorageService';
import { QwackyBackup, BackupSummary } from '../types';

interface Address {
  value: string;
  timestamp: number;
  notes?: string;
  username?: string;
}

export class ImportExportService {
  private storage: StorageService;
  
  constructor() {
    this.storage = new StorageService();
  }

  async importAddresses(data: string): Promise<{ success: boolean, count: number, error?: string }> {
    try {
      if (!data || typeof data !== 'string' || data.trim() === '') {
        return { success: false, count: 0, error: 'Import data is empty or invalid' };
      }

      let importedAddresses = [];

      try {
        const importData = JSON.parse(data);

        if (importData.addresses && Array.isArray(importData.addresses)) {
          importedAddresses = importData.addresses.map((addr: { value?: string, timestamp?: number, notes?: string }) => {
            if (!addr.value) {
              return null;
            }

            return {
              ...addr,
              value: addr.value.includes('@duck.com') ? addr.value.split('@')[0] : addr.value,
              timestamp: addr.timestamp || Date.now(),
              notes: addr.notes || ''
            };
          }).filter(Boolean);
        } else {
          return { success: false, count: 0, error: 'Invalid format: missing addresses array' };
        }
      } catch {
        return { success: false, count: 0, error: 'Invalid JSON format' };
      }

      const userData = await this.storage.getUserData();
      if (!userData || !userData.user || !userData.user.username) {
        return { success: false, count: 0, error: 'User data not found. Please log in again.' };
      }
      const username = userData.user.username;

      try {
        const currentAddresses = await this.storage.getAddresses();

        const existingAddressMap = new Map();
        currentAddresses.forEach((addr: Address) => {
          existingAddressMap.set(addr.value, true);
        });

        const newAddresses = importedAddresses.filter((addr: { value: string }) => 
          addr.value && !existingAddressMap.has(addr.value)
        );

        if (newAddresses.length === 0) {
          return { success: true, count: 0, error: 'No new addresses to import. All addresses already exist.' };
        }

        const newAddressesWithUsername = newAddresses.map((addr: any) => ({
          ...addr,
          username
        }));

        const mergedAddresses = [...newAddressesWithUsername, ...currentAddresses];

        const accountKey = `addresses_${username}`;
        await chrome.storage.local.set({ [accountKey]: mergedAddresses });

        const globalResult = await chrome.storage.local.get('generated_addresses');
        const globalAddresses = globalResult.generated_addresses || [];

        const updatedGlobalAddresses = [...newAddressesWithUsername, ...globalAddresses];
        await chrome.storage.local.set({ generated_addresses: updatedGlobalAddresses });
        
        return { 
          success: true, 
          count: newAddresses.length 
        };
      } catch (storageError: unknown) {
        return { 
          success: false, 
          count: 0, 
          error: `Storage error: ${storageError instanceof Error ? storageError.message : 'Failed to save imported addresses'}`
        };
      }
    } catch (error) {
      console.error('Error importing addresses:', error);
      return {
        success: false,
        count: 0,
        error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async exportBackup(selectedAccounts: string[], includeSession: boolean): Promise<{ data: string; summary: BackupSummary }> {
    try {
      const allAddresses: Array<{ value: string; timestamp: number; notes?: string }> = [];
      const allReverseAliases: Array<{ recipientEmail: string; alias: string; timestamp: number; notes?: string }> = [];
      const accountStats: BackupSummary['accounts'] = [];

      for (const username of selectedAccounts) {
        const addrKey = `addresses_${username}`;
        const aliasKey = `reverse_aliases_${username}`;
        const result = await chrome.storage.local.get([addrKey, aliasKey]);

        const addresses: Address[] = result[addrKey] || [];
        const reverseAliases = result[aliasKey] || [];

        accountStats.push({
          username,
          addresses: addresses.length,
          reverseAliases: reverseAliases.length
        });

        allAddresses.push(...addresses.map((addr: Address) => ({
          value: `${addr.value}@duck.com`,
          timestamp: addr.timestamp,
          notes: addr.notes || ''
        })));

        allReverseAliases.push(...reverseAliases.map((alias: any) => ({
          recipientEmail: alias.recipientEmail,
          alias: alias.alias,
          timestamp: alias.timestamp,
          notes: alias.notes || ''
        })));
      }

      const exportData: QwackyBackup = {
        version: '1.0',
        type: 'qwacky_backup',
        timestamp: Date.now(),
        account: selectedAccounts.map(u => `${u}@duck.com`).join(', '),
        addresses: allAddresses,
        reverseAliases: allReverseAliases
      };

      if (includeSession) {
        const storageResult = await chrome.storage.local.get([
          'accounts', 'currentAccount',
          'hide_user_info', 'hide_generated_addresses', 'hide_reverse_aliases',
          'contextMenuEnabled', 'syncEnabled'
        ]);

        const allStoredAccounts: Array<{ userData: any; username: string; lastUsed: number }> = storageResult.accounts || [];
        const filteredAccounts = allStoredAccounts.filter(a => selectedAccounts.includes(a.username));
        const perAccountData: Record<string, { addresses: any[]; reverseAliases: any[] }> = {};

        for (const username of selectedAccounts) {
          const addrKey = `addresses_${username}`;
          const aliasKey = `reverse_aliases_${username}`;
          const accountResult = await chrome.storage.local.get([addrKey, aliasKey]);

          perAccountData[username] = {
            addresses: accountResult[addrKey] || [],
            reverseAliases: accountResult[aliasKey] || []
          };
        }

        const themeMode = localStorage.getItem('themeMode');

        exportData.session = {
          currentAccount: storageResult.currentAccount || '',
          accounts: filteredAccounts,
          perAccountData,
          settings: {
            hideUserInfo: storageResult.hide_user_info || false,
            hideGeneratedAddresses: storageResult.hide_generated_addresses || false,
            hideReverseAliases: storageResult.hide_reverse_aliases || false,
            contextMenuEnabled: storageResult.contextMenuEnabled || false,
            syncEnabled: storageResult.syncEnabled || false,
            themeMode: themeMode ? JSON.parse(themeMode) : 'system'
          }
        };
      }

      const summary: BackupSummary = {
        action: 'export',
        accounts: accountStats,
        totalAddresses: allAddresses.length,
        totalReverseAliases: allReverseAliases.length,
        includesSession: includeSession
      };

      return { data: JSON.stringify(exportData, null, 2), summary };
    } catch (error) {
      console.error('Error exporting backup:', error);
      throw new Error('Failed to export backup');
    }
  }

  async importBackup(data: string): Promise<{ success: boolean; hasSession: boolean; summary?: BackupSummary; error?: string }> {
    try {
      if (!data || typeof data !== 'string' || data.trim() === '') {
        return { success: false, hasSession: false, error: 'Import data is empty or invalid' };
      }

      let backupData: QwackyBackup;
      try {
        backupData = JSON.parse(data);
      } catch {
        return { success: false, hasSession: false, error: 'Invalid JSON format' };
      }

      if (backupData.type !== 'qwacky_backup') {
        return { success: false, hasSession: false, error: 'Not a valid Qwacky backup file' };
      }

      if (backupData.session) {
        const session = backupData.session;

        const existingStorage = await chrome.storage.local.get(['accounts', 'currentAccount', 'user_data', 'access_token']);
        const existingAccounts: any[] = existingStorage.accounts || [];

        const mergedAccounts = [...existingAccounts];
        for (const importedAccount of session.accounts) {
          const exists = mergedAccounts.find(a => a.username === importedAccount.username);
          if (!exists) {
            mergedAccounts.push(importedAccount);
          }
        }

        const accountStats: BackupSummary['accounts'] = [];
        let totalNewAddresses = 0;
        let totalNewAliases = 0;
        let totalSkippedAddresses = 0;
        let totalSkippedAliases = 0;

        for (const [username, accountData] of Object.entries(session.perAccountData || {})) {
          const importAddresses = accountData.addresses || [];
          const importAliases = accountData.reverseAliases || [];

          const existingAddrResult = await chrome.storage.local.get(`addresses_${username}`);
          const existingAddresses: any[] = existingAddrResult[`addresses_${username}`] || [];
          const existingAddrMap = new Map(existingAddresses.map(a => [a.value, true]));
          const newAddresses = importAddresses.filter(a => !existingAddrMap.has(a.value));
          await chrome.storage.local.set({
            [`addresses_${username}`]: [...newAddresses, ...existingAddresses]
          });

          const existingAliasResult = await chrome.storage.local.get(`reverse_aliases_${username}`);
          const existingAliases: any[] = existingAliasResult[`reverse_aliases_${username}`] || [];
          const existingAliasMap = new Map(existingAliases.map(a => [a.recipientEmail, true]));
          const newAliases = importAliases.filter(a => !existingAliasMap.has(a.recipientEmail));
          await chrome.storage.local.set({
            [`reverse_aliases_${username}`]: [...newAliases, ...existingAliases]
          });

          accountStats.push({
            username,
            addresses: newAddresses.length,
            reverseAliases: newAliases.length
          });
          totalNewAddresses += newAddresses.length;
          totalNewAliases += newAliases.length;
          totalSkippedAddresses += importAddresses.length - newAddresses.length;
          totalSkippedAliases += importAliases.length - newAliases.length;
        }

        const alreadyLoggedIn = existingStorage.user_data && existingStorage.access_token;

        if (session.settings && !alreadyLoggedIn) {
          await chrome.storage.local.set({
            hide_user_info: session.settings.hideUserInfo || false,
            hide_generated_addresses: session.settings.hideGeneratedAddresses || false,
            hide_reverse_aliases: session.settings.hideReverseAliases || false,
            contextMenuEnabled: session.settings.contextMenuEnabled || false,
            syncEnabled: session.settings.syncEnabled || false
          });
        }

        const allAddresses: any[] = [];
        for (const account of mergedAccounts) {
          const addrResult = await chrome.storage.local.get(`addresses_${account.username}`);
          allAddresses.push(...(addrResult[`addresses_${account.username}`] || []));
        }

        if (alreadyLoggedIn) {
          await chrome.storage.local.set({
            accounts: mergedAccounts,
            generated_addresses: allAddresses
          });
        } else {
          const currentAcct = session.accounts.find(a => a.username === session.currentAccount);
          if (!currentAcct) {
            return { success: false, hasSession: false, error: 'Current account not found in session data' };
          }
          await chrome.storage.local.set({
            user_data: currentAcct.userData,
            access_token: currentAcct.userData.user.access_token,
            accounts: mergedAccounts,
            currentAccount: session.currentAccount,
            generated_addresses: allAddresses,
            loginState: 'dashboard'
          });
        }

        if (session.settings?.themeMode) {
          localStorage.setItem('themeMode', JSON.stringify(session.settings.themeMode));
        }

        const newAccountCount = session.accounts.filter(
          a => !existingAccounts.find(e => e.username === a.username)
        ).length;

        return {
          success: true,
          hasSession: true,
          summary: {
            action: 'import',
            accounts: accountStats,
            totalAddresses: totalNewAddresses,
            totalReverseAliases: totalNewAliases,
            includesSession: true,
            newAddresses: totalNewAddresses,
            newReverseAliases: totalNewAliases,
            newAccounts: newAccountCount,
            skippedAddresses: totalSkippedAddresses,
            skippedReverseAliases: totalSkippedAliases
          }
        };
      }

      const userData = await this.storage.getUserData();
      if (!userData || !userData.user || !userData.user.username) {
        return { success: false, hasSession: false, error: 'User data not found. Please log in first.' };
      }
      const username = userData.user.username;

      let newAddressCount = 0;
      if (backupData.addresses && backupData.addresses.length > 0) {
        const currentAddresses = await this.storage.getAddresses();
        const existingMap = new Map(currentAddresses.map((a: Address) => [a.value, true]));

        const newAddresses = backupData.addresses
          .map(addr => ({
            value: addr.value.includes('@duck.com') ? addr.value.split('@')[0] : addr.value,
            timestamp: addr.timestamp || Date.now(),
            notes: addr.notes || '',
            username
          }))
          .filter(addr => addr.value && !existingMap.has(addr.value));

        if (newAddresses.length > 0) {
          const merged = [...newAddresses, ...currentAddresses];
          await chrome.storage.local.set({ [`addresses_${username}`]: merged });

          const globalResult = await chrome.storage.local.get('generated_addresses');
          const globalAddresses = globalResult.generated_addresses || [];
          await chrome.storage.local.set({ generated_addresses: [...newAddresses, ...globalAddresses] });

          newAddressCount = newAddresses.length;
        }
      }

      let newAliasCount = 0;
      if (backupData.reverseAliases && backupData.reverseAliases.length > 0) {
        const currentAliases = await this.storage.getReverseAliases();
        const existingMap = new Map(currentAliases.map(a => [a.recipientEmail, true]));

        const newAliases = backupData.reverseAliases
          .filter(a => a.recipientEmail && !existingMap.has(a.recipientEmail))
          .map(a => ({
            recipientEmail: a.recipientEmail,
            alias: a.alias,
            timestamp: a.timestamp || Date.now(),
            lastModified: Date.now(),
            notes: a.notes || '',
            username
          }));

        if (newAliases.length > 0) {
          const merged = [...newAliases, ...currentAliases];
          await chrome.storage.local.set({ [`reverse_aliases_${username}`]: merged });
          newAliasCount = newAliases.length;
        }
      }

      const totalInAddresses = backupData.addresses?.length || 0;
      const totalInAliases = backupData.reverseAliases?.length || 0;

      return {
        success: true,
        hasSession: false,
        summary: {
          action: 'import',
          accounts: [{ username, addresses: newAddressCount, reverseAliases: newAliasCount }],
          totalAddresses: newAddressCount,
          totalReverseAliases: newAliasCount,
          includesSession: false,
          newAddresses: newAddressCount,
          newReverseAliases: newAliasCount,
          newAccounts: 0,
          skippedAddresses: totalInAddresses - newAddressCount,
          skippedReverseAliases: totalInAliases - newAliasCount
        }
      };
    } catch (error) {
      console.error('Error importing backup:', error);
      return {
        success: false,
        hasSession: false,
        error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
} 