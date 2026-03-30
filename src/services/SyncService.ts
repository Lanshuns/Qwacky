import { errorMessage } from '../utils/safeOps';
import { UserData } from '../types';

interface Address {
  value: string;
  timestamp: number;
  lastModified?: number;
  notes?: string;
  tags?: string[];
  username?: string;
}

interface ReverseAliasSync {
  recipientEmail: string;
  alias: string;
  timestamp: number;
  lastModified?: number;
  notes?: string;
  tags?: string[];
  username: string;
}

export interface SyncOptions {
  enabled: boolean;
  addresses: boolean;
  reverseAliases: boolean;
  session: boolean;
  syncAccounts: string[];
}

interface SessionSyncData {
  accounts: Array<{ userData: UserData; username: string; lastUsed: number }>;
  currentAccount: string;
  settings: {
    hideUserInfo: boolean;
    hideGeneratedAddresses: boolean;
    hideReverseAliases: boolean;
    contextMenuEnabled: boolean;
    themeMode: string;
  };
}

const DEFAULT_SYNC_OPTIONS: SyncOptions = {
  enabled: false,
  addresses: true,
  reverseAliases: true,
  session: false,
  syncAccounts: [],
};

export class SyncService {
  private static SYNC_OPTIONS_KEY = 'syncOptions';
  private static SYNC_ENABLED_KEY = 'syncEnabled';
  private static SYNC_LAST_SYNC_KEY = 'lastSyncTime';
  private static SESSION_CACHE_PREFIX = 'sync_cache_';
  private static COMPRESSION_THRESHOLD = 4096;
  private static DEBOUNCE_MS = 2000;

  private syncLock: Promise<void> = Promise.resolve();
  private pendingWrites = new Map<string, {
    data: any[];
    timer: ReturnType<typeof setTimeout>;
  }>();

  constructor() {
  }

  private acquireLock(): Promise<() => void> {
    let release: () => void;
    const newLock = new Promise<void>(resolve => { release = resolve; });
    const waitForPrev = this.syncLock;
    this.syncLock = newLock;
    return waitForPrev.then(() => release!);
  }

  async flushPendingWrites(): Promise<void> {
    const entries = Array.from(this.pendingWrites.entries());
    this.pendingWrites.clear();
    for (const [accountKey, { data, timer }] of entries) {
      clearTimeout(timer);
      const release = await this.acquireLock();
      try {
        await this.executeSyncWrite(accountKey, data);
      } catch (error) {
        console.error('Flush write error:', error);
      } finally {
        release();
      }
    }
  }

  private validateAddresses(data: any[]): Address[] {
    if (!Array.isArray(data)) return [];
    return data.filter(item =>
      item &&
      typeof item.value === 'string' &&
      typeof item.timestamp === 'number'
    );
  }

  private validateReverseAliases(data: any[]): ReverseAliasSync[] {
    if (!Array.isArray(data)) return [];
    return data.filter(item =>
      item &&
      typeof item.recipientEmail === 'string' &&
      typeof item.alias === 'string' &&
      typeof item.timestamp === 'number'
    );
  }

  async getSyncOptions(): Promise<SyncOptions> {
    const result = await chrome.storage.local.get([SyncService.SYNC_OPTIONS_KEY, SyncService.SYNC_ENABLED_KEY]);

    if (result[SyncService.SYNC_OPTIONS_KEY]) {
      return { ...DEFAULT_SYNC_OPTIONS, ...result[SyncService.SYNC_OPTIONS_KEY] };
    }

    if (result[SyncService.SYNC_ENABLED_KEY] !== undefined) {
      const migrated: SyncOptions = {
        ...DEFAULT_SYNC_OPTIONS,
        enabled: result[SyncService.SYNC_ENABLED_KEY],
      };
      await chrome.storage.local.set({ [SyncService.SYNC_OPTIONS_KEY]: migrated });
      await chrome.storage.local.remove(SyncService.SYNC_ENABLED_KEY);
      return migrated;
    }

    return { ...DEFAULT_SYNC_OPTIONS };
  }

  async setSyncOptions(options: Partial<SyncOptions>): Promise<void> {
    const current = await this.getSyncOptions();
    const updated = { ...current, ...options };
    await chrome.storage.local.set({ [SyncService.SYNC_OPTIONS_KEY]: updated });
  }

  private async isAccountSyncEnabled(username: string): Promise<boolean> {
    const options = await this.getSyncOptions();
    if (!options.enabled) return false;
    if (options.syncAccounts.length === 0) return true;
    return options.syncAccounts.includes(username);
  }

  private async compressData(data: string): Promise<string> {
    try {
      if (typeof CompressionStream === 'undefined') {
        console.warn('CompressionStream not available, storing uncompressed');
        return data;
      }

      const stream = new Blob([data]).stream();
      const compressedStream = stream.pipeThrough(
        new CompressionStream('gzip')
      );
      
      const reader = compressedStream.getReader();
      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const compressed = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      const base64 = btoa(String.fromCharCode(...compressed));
      return `__COMPRESSED__${base64}`;
    } catch (error) {
      console.error('Compression error:', error);
      return data;
    }
  }

  private async decompressData(data: any): Promise<string> {
    if (!data) {
      return '[]';
    }

    if (typeof data !== 'string') {
      return JSON.stringify(data);
    }

    if (!data.startsWith('__COMPRESSED__')) {
      return data;
    }

    try {
      if (typeof DecompressionStream === 'undefined') {
        console.error('DecompressionStream not available');
        return data;
      }

      const base64 = data.replace('__COMPRESSED__', '');
      const compressedData = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      
      const stream = new Blob([compressedData]).stream();
      const decompressedStream = stream.pipeThrough(
        new DecompressionStream('gzip')
      );
      
      const reader = decompressedStream.getReader();
      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const decompressed = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        decompressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      const decoder = new TextDecoder();
      return decoder.decode(decompressed);
    } catch (error) {
      console.error('Decompression error:', error);
      return typeof data === 'string' ? data : JSON.stringify(data);
    }
  }

  private async getFromSessionCache(key: string): Promise<any> {
    try {
      const cacheKey = SyncService.SESSION_CACHE_PREFIX + key;
      const result = await chrome.storage.session.get(cacheKey);
      return result[cacheKey] || null;
    } catch (error) {
      console.error('Session cache read error:', error);
      return null;
    }
  }

  private async saveToSessionCache(key: string, data: any): Promise<void> {
    try {
      const cacheKey = SyncService.SESSION_CACHE_PREFIX + key;
      await chrome.storage.session.set({ [cacheKey]: data });
    } catch (error) {
      console.error('Session cache write error:', error);
    }
  }

  private async clearSessionCache(key: string): Promise<void> {
    try {
      const cacheKey = SyncService.SESSION_CACHE_PREFIX + key;
      await chrome.storage.session.remove(cacheKey);
    } catch (error) {
      console.error('Session cache clear error:', error);
    }
  }

  private async getCurrentUsername(): Promise<string | null> {
    const result = await chrome.storage.local.get('user_data');
    const userData = result.user_data;
    return userData?.user?.username || null;
  }

  async isSyncEnabled(): Promise<boolean> {
    const options = await this.getSyncOptions();
    return options.enabled;
  }

  async setSyncEnabled(enabled: boolean): Promise<{ success: boolean; message: string }> {
    await this.setSyncOptions({ enabled });

    if (enabled) {
      return await this.migrateToSync();
    }

    return { success: true, message: 'Sync disabled' };
  }

  private async migrateDataToSync(localData: any[], syncKey: string, mergeFn: (local: any[], sync: any[]) => Promise<any[]>, validateFn: (data: any[]) => any[]): Promise<{ count: number; error?: string }> {
    const dataWithTimestamp = localData.map((item: any) => ({
      ...item,
      lastModified: item.lastModified || item.timestamp,
    }));

    const syncResult = await chrome.storage.sync.get(syncKey);
    let syncData: any[] = [];

    if (syncResult[syncKey]) {
      const decompressed = await this.decompressData(syncResult[syncKey]);
      try {
        syncData = validateFn(JSON.parse(decompressed));
      } catch {
        syncData = [];
      }
    }

    const merged = await mergeFn(dataWithTimestamp, syncData);

    const mergedJson = JSON.stringify(merged);
    const finalData = mergedJson.length > SyncService.COMPRESSION_THRESHOLD
      ? await this.compressData(mergedJson)
      : mergedJson;

    const dataSize = new Blob([finalData]).size;
    if (dataSize > 8000) {
      return { count: 0, error: `Data too large (${Math.round(dataSize / 1024)}KB). Maximum is 8KB per account.` };
    }

    await chrome.storage.sync.set({
      [syncKey]: finalData,
      [SyncService.SYNC_LAST_SYNC_KEY]: Date.now(),
    });

    await this.saveToSessionCache(syncKey, merged);
    return { count: merged.length };
  }

  async migrateToSync(): Promise<{ success: boolean; message: string }> {
    try {
      const username = await this.getCurrentUsername();
      if (!username) {
        return { success: false, message: 'No user logged in' };
      }

      const options = await this.getSyncOptions();
      const parts: string[] = [];

      if (options.addresses) {
        const accountKey = `addresses_${username}`;
        const localResult = await chrome.storage.local.get(accountKey);
        const localAddresses = localResult[accountKey] || [];

        if (localAddresses.length > 0) {
          const result = await this.migrateDataToSync(
            localAddresses, accountKey,
            (l: any[], s: any[]) => this.mergeAddresses(l, s),
            (d: any[]) => this.validateAddresses(d)
          );
          if (result.error) return { success: false, message: result.error };
          parts.push(`${result.count} addresses`);
        }

        const localData = await chrome.storage.local.get('user_data');
        if (localData.user_data?.stats?.addresses_generated) {
          await this.syncTotalCount(localData.user_data.stats.addresses_generated);
        }
      }

      if (options.reverseAliases) {
        const aliasKey = `reverse_aliases_${username}`;
        const localResult = await chrome.storage.local.get(aliasKey);
        const localAliases = localResult[aliasKey] || [];

        if (localAliases.length > 0) {
          const result = await this.migrateDataToSync(
            localAliases, aliasKey,
            (l: any[], s: any[]) => this.mergeReverseAliases(l, s),
            (d: any[]) => this.validateReverseAliases(d)
          );
          if (result.error) return { success: false, message: result.error };
          parts.push(`${result.count} reverse aliases`);
        }
      }

      if (options.session) {
        await this.saveSessionToSync();
        parts.push('session data');
      }

      if (parts.length === 0) {
        await chrome.storage.sync.set({ [SyncService.SYNC_LAST_SYNC_KEY]: Date.now() });
        return { success: true, message: 'No data to migrate' };
      }

      return {
        success: true,
        message: `Successfully synced ${parts.join(', ')}`,
      };
    } catch (error: unknown) {
      console.error('Migration error:', error);

      if (errorMessage(error).includes('QUOTA_BYTES')) {
        return {
          success: false,
          message: 'Storage quota exceeded. Try reducing the amount of synced data.',
        };
      }

      return {
        success: false,
        message: errorMessage(error) || 'Migration failed',
      };
    }
  }

  async mergeAddresses(localAddresses: Address[], syncAddresses: Address[]): Promise<Address[]> {
    const merged = new Map<string, Address>();

    [...localAddresses, ...syncAddresses].forEach(addr => {
      const existing = merged.get(addr.value);

      if (!existing) {
        merged.set(addr.value, {
          ...addr,
          lastModified: addr.lastModified || addr.timestamp
        });
      } else {
        const existingMod = existing.lastModified || existing.timestamp;
        const incomingMod = addr.lastModified || addr.timestamp;

        if (incomingMod > existingMod) {
          merged.set(addr.value, addr);
        } else if (incomingMod === existingMod) {
          const mergedNotes = (addr.notes && addr.notes !== existing.notes)
            ? `${existing.notes || ''} | ${addr.notes}`.trim().replace(/^\| /, '')
            : existing.notes;
          const mergedTags = [...new Set([...(existing.tags || []), ...(addr.tags || [])])];
          merged.set(addr.value, { ...existing, notes: mergedNotes, tags: mergedTags.length > 0 ? mergedTags : existing.tags });
        }
      }
    });

    return Array.from(merged.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  async saveAddressesToSync(username: string, addresses: Address[]): Promise<void> {
    const options = await this.getSyncOptions();
    if (!options.enabled || !options.addresses || !await this.isAccountSyncEnabled(username)) {
      return;
    }

    const accountKey = `addresses_${username}`;

    const addressesWithTimestamp = addresses.map(addr => ({
      ...addr,
      lastModified: addr.lastModified || Date.now()
    }));

    const pending = this.pendingWrites.get(accountKey);
    if (pending) {
      clearTimeout(pending.timer);
    }

    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(async () => {
        this.pendingWrites.delete(accountKey);
        const release = await this.acquireLock();
        try {
          await this.executeSyncWrite(accountKey, addressesWithTimestamp);
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          release();
        }
      }, SyncService.DEBOUNCE_MS);

      this.pendingWrites.set(accountKey, { data: addressesWithTimestamp, timer });
    });
  }

  private async executeSyncWrite(accountKey: string, data: any[]): Promise<void> {
    try {
      const jsonData = JSON.stringify(data);
      const dataToStore = jsonData.length > SyncService.COMPRESSION_THRESHOLD
        ? await this.compressData(jsonData)
        : jsonData;

      await chrome.storage.sync.set({
        [accountKey]: dataToStore,
        [SyncService.SYNC_LAST_SYNC_KEY]: Date.now()
      });

      await this.saveToSessionCache(accountKey, data);
    } catch (error: unknown) {
      console.error('Sync save error:', error);

      if (errorMessage(error).includes('QUOTA_BYTES')) {
        await this.setSyncEnabled(false);
        chrome.runtime.sendMessage({ action: 'syncAutoDisabled', reason: 'quota_exceeded' }).catch(() => {});
        throw new Error('Sync quota exceeded. Sync has been disabled.');
      }

      throw error;
    }
  }

  async getAddressesFromSync(username: string): Promise<Address[] | null> {
    const options = await this.getSyncOptions();
    if (!options.enabled || !options.addresses || !await this.isAccountSyncEnabled(username)) {
      return null;
    }

    const accountKey = `addresses_${username}`;
    
    const cached = await this.getFromSessionCache(accountKey);
    if (cached) {
      console.log('Session cache hit for', accountKey);
      return cached;
    }

    try {
      const result = await chrome.storage.sync.get(accountKey);
      
      if (!result[accountKey]) {
        return [];
      }

      const data = result[accountKey];
      const jsonData = await this.decompressData(data);
      let addresses: Address[];
      try {
        addresses = this.validateAddresses(JSON.parse(jsonData));
      } catch {
        addresses = [];
      }

      await this.saveToSessionCache(accountKey, addresses);

      return addresses;
    } catch (error) {
      console.error('Sync get error:', error);
      return null;
    }
  }

  async handleSyncChange(accountKey: string, newValue: any): Promise<void> {
    const syncEnabled = await this.isSyncEnabled();
    if (!syncEnabled) {
      return;
    }

    const username = accountKey.replace('addresses_', '');
    const currentUsername = await this.getCurrentUsername();

    if (username !== currentUsername) {
      return;
    }

    const release = await this.acquireLock();
    try {
      const jsonData = await this.decompressData(newValue);
      let syncAddresses: Address[];
      try {
        syncAddresses = this.validateAddresses(JSON.parse(jsonData));
      } catch {
        syncAddresses = [];
      }

      const localResult = await chrome.storage.local.get(accountKey);
      const localAddresses = localResult[accountKey] || [];

      const mergedAddresses = await this.mergeAddresses(localAddresses, syncAddresses);

      await chrome.storage.local.set({ [accountKey]: mergedAddresses });

      await this.saveToSessionCache(accountKey, mergedAddresses);

      chrome.runtime.sendMessage({
        action: 'syncAddressesUpdated',
        addresses: mergedAddresses
      }).catch((err: unknown) => {
        const msg = errorMessage(err);
        if (!msg.includes('Receiving end does not exist')) {
          console.error('Message send failed:', msg);
        }
      });
    } finally {
      release();
    }
  }

  async mergeReverseAliases(local: ReverseAliasSync[], sync: ReverseAliasSync[]): Promise<ReverseAliasSync[]> {
    const merged = new Map<string, ReverseAliasSync>();

    [...local, ...sync].forEach(alias => {
      const existing = merged.get(alias.recipientEmail);

      if (!existing) {
        merged.set(alias.recipientEmail, {
          ...alias,
          lastModified: alias.lastModified || alias.timestamp,
        });
      } else {
        const existingMod = existing.lastModified || existing.timestamp;
        const incomingMod = alias.lastModified || alias.timestamp;

        if (incomingMod > existingMod) {
          merged.set(alias.recipientEmail, alias);
        } else if (incomingMod === existingMod) {
          const mergedNotes = (alias.notes && alias.notes !== existing.notes)
            ? `${existing.notes || ''} | ${alias.notes}`.trim().replace(/^\| /, '')
            : existing.notes;
          const mergedTags = [...new Set([...(existing.tags || []), ...(alias.tags || [])])];
          merged.set(alias.recipientEmail, {
            ...existing,
            notes: mergedNotes,
            tags: mergedTags.length > 0 ? mergedTags : existing.tags,
          });
        }
      }
    });

    return Array.from(merged.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  async saveReverseAliasesToSync(username: string, aliases: ReverseAliasSync[]): Promise<void> {
    const options = await this.getSyncOptions();
    if (!options.enabled || !options.reverseAliases || !await this.isAccountSyncEnabled(username)) {
      return;
    }

    const accountKey = `reverse_aliases_${username}`;

    const aliasesWithTimestamp = aliases.map(alias => ({
      ...alias,
      lastModified: alias.lastModified || Date.now(),
    }));

    const pending = this.pendingWrites.get(accountKey);
    if (pending) {
      clearTimeout(pending.timer);
    }

    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(async () => {
        this.pendingWrites.delete(accountKey);
        const release = await this.acquireLock();
        try {
          await this.executeSyncWrite(accountKey, aliasesWithTimestamp);
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          release();
        }
      }, SyncService.DEBOUNCE_MS);

      this.pendingWrites.set(accountKey, { data: aliasesWithTimestamp, timer });
    });
  }

  async getReverseAliasesFromSync(username: string): Promise<ReverseAliasSync[] | null> {
    const options = await this.getSyncOptions();
    if (!options.enabled || !options.reverseAliases || !await this.isAccountSyncEnabled(username)) {
      return null;
    }

    const accountKey = `reverse_aliases_${username}`;

    const cached = await this.getFromSessionCache(accountKey);
    if (cached) {
      return cached;
    }

    try {
      const result = await chrome.storage.sync.get(accountKey);
      if (!result[accountKey]) {
        return [];
      }

      const jsonData = await this.decompressData(result[accountKey]);
      let aliases: ReverseAliasSync[];
      try {
        aliases = this.validateReverseAliases(JSON.parse(jsonData));
      } catch {
        aliases = [];
      }

      await this.saveToSessionCache(accountKey, aliases);
      return aliases;
    } catch (error) {
      console.error('Sync get reverse aliases error:', error);
      return null;
    }
  }

  async handleReverseAliasSyncChange(accountKey: string, newValue: any): Promise<void> {
    const options = await this.getSyncOptions();
    if (!options.enabled || !options.reverseAliases) {
      return;
    }

    const username = accountKey.replace('reverse_aliases_', '');
    const currentUsername = await this.getCurrentUsername();

    if (username !== currentUsername) {
      return;
    }

    const release = await this.acquireLock();
    try {
      const jsonData = await this.decompressData(newValue);
      let syncAliases: ReverseAliasSync[];
      try {
        syncAliases = this.validateReverseAliases(JSON.parse(jsonData));
      } catch {
        syncAliases = [];
      }

      const localResult = await chrome.storage.local.get(accountKey);
      const localAliases = localResult[accountKey] || [];

      const mergedAliases = await this.mergeReverseAliases(localAliases, syncAliases);

      await chrome.storage.local.set({ [accountKey]: mergedAliases });
      await this.saveToSessionCache(accountKey, mergedAliases);

      chrome.runtime.sendMessage({
        action: 'syncReverseAliasesUpdated',
        reverseAliases: mergedAliases,
      }).catch((err: unknown) => {
        const msg = errorMessage(err);
        if (!msg.includes('Receiving end does not exist')) {
          console.error('Message send failed:', msg);
        }
      });
    } finally {
      release();
    }
  }

  async saveSessionToSync(): Promise<void> {
    const options = await this.getSyncOptions();
    if (!options.enabled || !options.session) {
      return;
    }

    try {
      const result = await chrome.storage.local.get(['accounts', 'currentAccount', 'hide_user_info', 'hide_generated_addresses', 'hide_reverse_aliases', 'contextMenuEnabled']);
      const accounts: Array<{ userData: UserData; username: string; lastUsed: number }> = result.accounts || [];

      const filteredAccounts = options.syncAccounts.length > 0
        ? accounts.filter(acc => options.syncAccounts.includes(acc.username))
        : accounts;

      if (filteredAccounts.length === 0) return;

      const sessionData: SessionSyncData = {
        accounts: filteredAccounts,
        currentAccount: result.currentAccount || '',
        settings: {
          hideUserInfo: result.hide_user_info || false,
          hideGeneratedAddresses: result.hide_generated_addresses || false,
          hideReverseAliases: result.hide_reverse_aliases || false,
          contextMenuEnabled: result.contextMenuEnabled || false,
          themeMode: (await chrome.storage.local.get('themeMode')).themeMode || 'system',
        },
      };

      const jsonData = JSON.stringify(sessionData);
      const dataToStore = jsonData.length > SyncService.COMPRESSION_THRESHOLD
        ? await this.compressData(jsonData)
        : jsonData;

      await chrome.storage.sync.set({
        session_data: dataToStore,
        [SyncService.SYNC_LAST_SYNC_KEY]: Date.now(),
      });
    } catch (error) {
      console.error('Session sync save error:', error);
    }
  }

  async getSessionFromSync(): Promise<SessionSyncData | null> {
    const options = await this.getSyncOptions();
    if (!options.enabled || !options.session) {
      return null;
    }

    try {
      const result = await chrome.storage.sync.get('session_data');
      if (!result.session_data) return null;

      const jsonData = await this.decompressData(result.session_data);
      try {
        const parsed = JSON.parse(jsonData);
        if (parsed && Array.isArray(parsed.accounts)) {
          return parsed as SessionSyncData;
        }
      } catch {}
      return null;
    } catch (error) {
      console.error('Session sync get error:', error);
      return null;
    }
  }

  async handleSessionSyncChange(newValue: any): Promise<void> {
    const options = await this.getSyncOptions();
    if (!options.enabled || !options.session) {
      return;
    }

    try {
      const jsonData = await this.decompressData(newValue);
      let sessionData: SessionSyncData;
      try {
        sessionData = JSON.parse(jsonData);
        if (!sessionData || !Array.isArray(sessionData.accounts)) return;
      } catch {
        return;
      }

      const localResult = await chrome.storage.local.get('accounts');
      const localAccounts: Array<{ username: string }> = localResult.accounts || [];
      const localUsernames = new Set(localAccounts.map(a => a.username));

      const newAccounts = sessionData.accounts.filter(a => !localUsernames.has(a.username));

      if (newAccounts.length > 0) {
        chrome.runtime.sendMessage({
          action: 'syncSessionAvailable',
          newAccounts: newAccounts.map(a => a.username),
          sessionData,
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Session sync change error:', error);
    }
  }

  async restoreSessionFromSync(sessionData: SessionSyncData): Promise<{ restored: number }> {
    const localResult = await chrome.storage.local.get(['accounts', 'currentAccount']);
    const localAccounts: Array<{ userData: UserData; username: string; lastUsed: number }> = localResult.accounts || [];
    const localMap = new Map(localAccounts.map(a => [a.username, a]));

    let restored = 0;
    for (const syncAccount of sessionData.accounts) {
      const existing = localMap.get(syncAccount.username);
      if (!existing) {
        localMap.set(syncAccount.username, syncAccount);
        restored++;
      } else if (syncAccount.lastUsed > existing.lastUsed) {
        localMap.set(syncAccount.username, syncAccount);
      }
    }

    const mergedAccounts = Array.from(localMap.values());
    const updates: Record<string, any> = { accounts: mergedAccounts };

    if (!localResult.currentAccount && sessionData.currentAccount) {
      updates.currentAccount = sessionData.currentAccount;
      const currentAcc = localMap.get(sessionData.currentAccount);
      if (currentAcc) {
        updates.user_data = currentAcc.userData;
        updates.access_token = currentAcc.userData.user.access_token;
        updates.loginState = 'dashboard';
      }
    }

    await chrome.storage.local.set(updates);

    if (sessionData.settings) {
      await chrome.storage.local.set({
        hide_user_info: sessionData.settings.hideUserInfo,
        hide_generated_addresses: sessionData.settings.hideGeneratedAddresses,
        hide_reverse_aliases: sessionData.settings.hideReverseAliases,
        contextMenuEnabled: sessionData.settings.contextMenuEnabled,
      });
      if (sessionData.settings.themeMode) {
        await chrome.storage.local.set({ themeMode: sessionData.settings.themeMode });
      }
    }

    return { restored };
  }

  async pullFromSync(): Promise<{ success: boolean; message: string }> {
    const options = await this.getSyncOptions();
    if (!options.enabled) {
      return { success: false, message: 'Sync is not enabled' };
    }

    try {
      const username = await this.getCurrentUsername();
      if (!username) {
        return { success: false, message: 'No user logged in' };
      }

      const parts: string[] = [];

      if (options.addresses && await this.isAccountSyncEnabled(username)) {
        const accountKey = `addresses_${username}`;
        const syncResult = await chrome.storage.sync.get(accountKey);

        if (syncResult[accountKey]) {
          const jsonData = await this.decompressData(syncResult[accountKey]);
          let syncAddresses: Address[];
          try {
            syncAddresses = this.validateAddresses(JSON.parse(jsonData));
          } catch {
            syncAddresses = [];
          }

          const localResult = await chrome.storage.local.get(accountKey);
          const localAddresses = localResult[accountKey] || [];
          const mergedAddresses = await this.mergeAddresses(localAddresses, syncAddresses);

          await chrome.storage.local.set({ [accountKey]: mergedAddresses });
          await this.saveToSessionCache(accountKey, mergedAddresses);

          const localData = await chrome.storage.local.get('user_data');
          if (localData.user_data?.stats?.addresses_generated) {
            const syncedCount = await this.syncTotalCount(localData.user_data.stats.addresses_generated);
            if (syncedCount !== localData.user_data.stats.addresses_generated) {
              localData.user_data.stats.addresses_generated = syncedCount;
              await chrome.storage.local.set({ user_data: localData.user_data });

              const result = await chrome.storage.local.get(['accounts', 'currentAccount']);
              if (result.accounts && result.currentAccount === username) {
                const updatedAccounts = result.accounts.map((acc: any) => {
                  if (acc.username === username) {
                    return { ...acc, userData: { ...acc.userData, stats: { ...acc.userData.stats, addresses_generated: syncedCount } } };
                  }
                  return acc;
                });
                await chrome.storage.local.set({ accounts: updatedAccounts });
              }
            }
          }

          chrome.runtime.sendMessage({ action: 'syncAddressesUpdated', addresses: mergedAddresses }).catch((err: unknown) => {
            const msg = errorMessage(err);
            if (!msg.includes('Receiving end does not exist')) console.error('Message send failed:', msg);
          });

          parts.push(`${mergedAddresses.length} addresses`);
        }
      }

      if (options.reverseAliases && await this.isAccountSyncEnabled(username)) {
        const aliasKey = `reverse_aliases_${username}`;
        const syncResult = await chrome.storage.sync.get(aliasKey);

        if (syncResult[aliasKey]) {
          const jsonData = await this.decompressData(syncResult[aliasKey]);
          let syncAliases: ReverseAliasSync[];
          try {
            syncAliases = this.validateReverseAliases(JSON.parse(jsonData));
          } catch {
            syncAliases = [];
          }

          const localResult = await chrome.storage.local.get(aliasKey);
          const localAliases = localResult[aliasKey] || [];
          const mergedAliases = await this.mergeReverseAliases(localAliases, syncAliases);

          await chrome.storage.local.set({ [aliasKey]: mergedAliases });
          await this.saveToSessionCache(aliasKey, mergedAliases);

          chrome.runtime.sendMessage({ action: 'syncReverseAliasesUpdated', reverseAliases: mergedAliases }).catch((err: unknown) => {
            const msg = errorMessage(err);
            if (!msg.includes('Receiving end does not exist')) console.error('Message send failed:', msg);
          });

          parts.push(`${mergedAliases.length} reverse aliases`);
        }
      }

      if (options.session) {
        const sessionData = await this.getSessionFromSync();
        if (sessionData && sessionData.accounts.length > 0) {
          const localResult = await chrome.storage.local.get('accounts');
          const localAccounts: Array<{ username: string }> = localResult.accounts || [];
          const localUsernames = new Set(localAccounts.map(a => a.username));
          const newAccounts = sessionData.accounts.filter(a => !localUsernames.has(a.username));

          if (newAccounts.length > 0) {
            chrome.runtime.sendMessage({
              action: 'syncSessionAvailable',
              newAccounts: newAccounts.map(a => a.username),
              sessionData,
            }).catch(() => {});
          }
          parts.push('session data');
        }
      }

      return {
        success: true,
        message: parts.length > 0 ? `Successfully synced ${parts.join(', ')}` : 'No synced data found',
      };
    } catch (error: unknown) {
      console.error('Pull from sync error:', error);
      return {
        success: false,
        message: errorMessage(error) || 'Failed to pull from sync',
      };
    }
  }

  async syncTotalCount(localCount: number): Promise<number> {
    const syncEnabled = await this.isSyncEnabled();
    if (!syncEnabled) {
      return localCount;
    }

    try {
      const username = await this.getCurrentUsername();
      if (!username) {
        return localCount;
      }

      const countKey = `total_count_${username}`;
      const syncResult = await chrome.storage.sync.get(countKey);
      const syncCount = syncResult[countKey] || 0;
      const maxCount = Math.max(localCount, syncCount);

      if (maxCount !== syncCount) {
        await chrome.storage.sync.set({ [countKey]: maxCount });
      }

      return maxCount;
    } catch (error) {
      console.error('Error syncing total count:', error);
      return localCount;
    }
  }

  async getSyncedTotalCount(): Promise<number | null> {
    const syncEnabled = await this.isSyncEnabled();
    if (!syncEnabled) {
      return null;
    }

    try {
      const username = await this.getCurrentUsername();
      if (!username) {
        return null;
      }

      const countKey = `total_count_${username}`;
      const syncResult = await chrome.storage.sync.get(countKey);
      return syncResult[countKey] || null;
    } catch (error) {
      console.error('Error getting synced count:', error);
      return null;
    }
  }

  async getSyncStats(): Promise<{
    enabled: boolean;
    lastSync: number | null;
    bytesInUse: number;
    quotaBytes: number;
    percentUsed: number;
  }> {
    const enabled = await this.isSyncEnabled();
    const lastSyncResult = await chrome.storage.sync.get(SyncService.SYNC_LAST_SYNC_KEY);
    const lastSync = lastSyncResult[SyncService.SYNC_LAST_SYNC_KEY] || null;

    try {
      const bytesInUse = await chrome.storage.sync.getBytesInUse();
      const quotaBytes = chrome.storage.sync.QUOTA_BYTES || 102400;
      const percentUsed = (bytesInUse / quotaBytes) * 100;

      return {
        enabled,
        lastSync,
        bytesInUse,
        quotaBytes,
        percentUsed
      };
    } catch (error) {
      return {
        enabled,
        lastSync,
        bytesInUse: 0,
        quotaBytes: 102400,
        percentUsed: 0
      };
    }
  }

  async clearSyncData(): Promise<void> {
    const allKeys = await chrome.storage.sync.get();
    for (const key of Object.keys(allKeys)) {
      if (key.startsWith('addresses_') || key.startsWith('reverse_aliases_')) {
        await this.clearSessionCache(key);
      }
    }

    await chrome.storage.sync.clear();
    await chrome.storage.local.remove([
      SyncService.SYNC_OPTIONS_KEY,
      SyncService.SYNC_ENABLED_KEY,
    ]);
  }
}
