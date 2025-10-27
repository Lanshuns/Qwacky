interface Address {
  value: string;
  timestamp: number;
  lastModified?: number;
  notes?: string;
  username?: string;
}

export class SyncService {
  private static SYNC_ENABLED_KEY = 'syncEnabled';
  private static SYNC_LAST_SYNC_KEY = 'lastSyncTime';
  private static SESSION_CACHE_PREFIX = 'sync_cache_';
  private static COMPRESSION_THRESHOLD = 4096;

  constructor() {
  }
  private async compressData(data: string): Promise<string> {
    try {
      if (!('CompressionStream' in window)) {
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
      if (!('DecompressionStream' in window)) {
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
    const result = await chrome.storage.local.get(SyncService.SYNC_ENABLED_KEY);
    return result[SyncService.SYNC_ENABLED_KEY] || false;
  }

  async setSyncEnabled(enabled: boolean): Promise<void> {
    await chrome.storage.local.set({ [SyncService.SYNC_ENABLED_KEY]: enabled });

    if (enabled) {
      await this.migrateToSync();
    }
  }

  async migrateToSync(): Promise<{ success: boolean; message: string }> {
    try {
      const username = await this.getCurrentUsername();
      if (!username) {
        return { success: false, message: 'No user logged in' };
      }

      const accountKey = `addresses_${username}`;
      
      const localResult = await chrome.storage.local.get(accountKey);
      const localAddresses = localResult[accountKey] || [];

      if (localAddresses.length === 0) {
        await chrome.storage.sync.set({ [SyncService.SYNC_LAST_SYNC_KEY]: Date.now() });
        return { success: true, message: 'No addresses to migrate' };
      }

      const addressesWithTimestamp = localAddresses.map((addr: Address) => ({
        ...addr,
        lastModified: addr.lastModified || addr.timestamp
      }));

      const jsonData = JSON.stringify(addressesWithTimestamp);
      const originalSize = new Blob([jsonData]).size;

      let dataToStore = jsonData;
      let compressed = false;
      
      if (originalSize > SyncService.COMPRESSION_THRESHOLD) {
        dataToStore = await this.compressData(jsonData);
        compressed = true;
        const compressedSize = new Blob([dataToStore]).size;
        console.log(`Compressed: ${originalSize}B → ${compressedSize}B (${Math.round((1 - compressedSize/originalSize) * 100)}% reduction)`);
      }

      const dataSize = new Blob([dataToStore]).size;
      if (dataSize > 8000) {
        return { 
          success: false, 
          message: `Data too large (${Math.round(dataSize / 1024)}KB). Maximum is 8KB per account.` 
        };
      }

      const syncResult = await chrome.storage.sync.get(accountKey);
      let syncAddresses = [];
      
      if (syncResult[accountKey]) {
        const syncData = syncResult[accountKey];
        const decompressed = await this.decompressData(syncData);
        syncAddresses = JSON.parse(decompressed);
      }

      const mergedAddresses = await this.mergeAddresses(localAddresses, syncAddresses);

      const mergedJson = JSON.stringify(mergedAddresses);
      const finalData = mergedJson.length > SyncService.COMPRESSION_THRESHOLD
        ? await this.compressData(mergedJson)
        : mergedJson;

      await chrome.storage.sync.set({ 
        [accountKey]: finalData,
        [SyncService.SYNC_LAST_SYNC_KEY]: Date.now()
      });

      await this.saveToSessionCache(accountKey, mergedAddresses);

      const localData = await chrome.storage.local.get('user_data');
      if (localData.user_data?.stats?.addresses_generated) {
        await this.syncTotalCount(localData.user_data.stats.addresses_generated);
      }

      return { 
        success: true, 
        message: `Successfully synced ${mergedAddresses.length} addresses${compressed ? ' (compressed)' : ''}` 
      };
    } catch (error: any) {
      console.error('Migration error:', error);
      
      if (error.message?.includes('QUOTA_BYTES')) {
        return { 
          success: false, 
          message: 'Storage quota exceeded. Try reducing the number of addresses.' 
        };
      }
      
      return { 
        success: false, 
        message: error.message || 'Migration failed' 
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
        } else if (incomingMod === existingMod && addr.notes && addr.notes !== existing.notes) {
          merged.set(addr.value, {
            ...existing,
            notes: `${existing.notes || ''} | ${addr.notes}`.trim().replace(/^\| /, '')
          });
        }
      }
    });

    return Array.from(merged.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  async saveAddressesToSync(username: string, addresses: Address[]): Promise<void> {
    const syncEnabled = await this.isSyncEnabled();
    if (!syncEnabled) {
      return;
    }

    const accountKey = `addresses_${username}`;

    const addressesWithTimestamp = addresses.map(addr => ({
      ...addr,
      lastModified: addr.lastModified || Date.now()
    }));

    try {
      const jsonData = JSON.stringify(addressesWithTimestamp);
      const dataToStore = jsonData.length > SyncService.COMPRESSION_THRESHOLD
        ? await this.compressData(jsonData)
        : jsonData;

      await chrome.storage.sync.set({ 
        [accountKey]: dataToStore,
        [SyncService.SYNC_LAST_SYNC_KEY]: Date.now()
      });

      await this.saveToSessionCache(accountKey, addressesWithTimestamp);
    } catch (error: any) {
      console.error('Sync save error:', error);
      
      if (error.message?.includes('QUOTA_BYTES')) {
        await this.setSyncEnabled(false);
        throw new Error('Sync quota exceeded. Sync has been disabled.');
      }
      
      throw error;
    }
  }

  async getAddressesFromSync(username: string): Promise<Address[] | null> {
    const syncEnabled = await this.isSyncEnabled();
    if (!syncEnabled) {
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
      const addresses = JSON.parse(jsonData);

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

    const jsonData = await this.decompressData(newValue);
    const syncAddresses = JSON.parse(jsonData);

    const localResult = await chrome.storage.local.get(accountKey);
    const localAddresses = localResult[accountKey] || [];

    const mergedAddresses = await this.mergeAddresses(localAddresses, syncAddresses);

    await chrome.storage.local.set({ [accountKey]: mergedAddresses });

    await this.saveToSessionCache(accountKey, mergedAddresses);

    try {
      chrome.runtime.sendMessage({
        action: 'syncAddressesUpdated',
        addresses: mergedAddresses
      });
    } catch (error) {
    }
  }

  async pullFromSync(): Promise<{ success: boolean; message: string }> {
    const syncEnabled = await this.isSyncEnabled();
    if (!syncEnabled) {
      return { success: false, message: 'Sync is not enabled' };
    }

    try {
      const username = await this.getCurrentUsername();
      if (!username) {
        return { success: false, message: 'No user logged in' };
      }

      const accountKey = `addresses_${username}`;

      const syncResult = await chrome.storage.sync.get(accountKey);
      
      if (!syncResult[accountKey]) {
        return { success: true, message: 'No synced data found' };
      }

      const jsonData = await this.decompressData(syncResult[accountKey]);
      const syncAddresses = JSON.parse(jsonData);

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
          
          const username = localData.user_data.user?.username;
          const result = await chrome.storage.local.get(['accounts', 'currentAccount']);
          if (username && result.accounts && result.currentAccount === username) {
            const updatedAccounts = result.accounts.map((acc: any) => {
              if (acc.username === username) {
                return {
                  ...acc,
                  userData: {
                    ...acc.userData,
                    stats: {
                      ...acc.userData.stats,
                      addresses_generated: syncedCount
                    }
                  }
                };
              }
              return acc;
            });
            await chrome.storage.local.set({ accounts: updatedAccounts });
          }
        }
      }

      try {
        chrome.runtime.sendMessage({
          action: 'syncAddressesUpdated',
          addresses: mergedAddresses
        });
      } catch (error) {
      }

      return { 
        success: true, 
        message: `Successfully synced ${mergedAddresses.length} addresses` 
      };
    } catch (error: any) {
      console.error('Pull from sync error:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to pull from sync' 
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
      if (key.startsWith('addresses_')) {
        await this.clearSessionCache(key);
      }
    }

    await chrome.storage.sync.clear();
    await chrome.storage.local.remove([
      SyncService.SYNC_ENABLED_KEY
    ]);
  }
}
