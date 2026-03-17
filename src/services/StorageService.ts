import { UserData, ReverseAlias } from '../types';
import { SyncService } from './SyncService';

interface Address {
  value: string;
  timestamp: number;
  lastModified?: number;
  notes?: string;
  tags?: string[];
  username?: string;
}

export class StorageService {
  private syncService: SyncService;

  constructor() {
    this.syncService = new SyncService();
  }

  async getUserData(): Promise<UserData | null> {
    const result = await chrome.storage.local.get('user_data');
    return result.user_data || null;
  }

  async saveUserData(data: any): Promise<void> {
    await chrome.storage.local.set({
      access_token: data.access_token,
      user_data: data.dashboard
    });
  }

  async getCurrentUsername(): Promise<string | null> {
    const userData = await this.getUserData();
    return userData?.user?.username || null;
  }

  async saveGeneratedAddress(address: string, notes?: string): Promise<void> {
    try {
      const username = await this.getCurrentUsername();
      if (!username) {
        throw new Error('User data not found');
      }

      const newAddress = {
        value: address,
        timestamp: Date.now(),
        lastModified: Date.now(),
        notes: notes || '',
        username: username
      };

      const accountKey = `addresses_${username}`;
      const accountResult = await chrome.storage.local.get(accountKey);
      const accountAddresses = accountResult[accountKey] || [];
      
      const updatedAddresses = [newAddress, ...accountAddresses];
      
      await chrome.storage.local.set({
        [accountKey]: updatedAddresses
      });

      const globalResult = await chrome.storage.local.get('generated_addresses');
      const globalAddresses = globalResult.generated_addresses || [];

      const otherUserAddresses = globalAddresses.filter((addr: Address) => 
        !addr.username || addr.username !== username
      );
      
      await chrome.storage.local.set({
        generated_addresses: [newAddress, ...otherUserAddresses]
      });

      try {
        await this.syncService.saveAddressesToSync(username, updatedAddresses);
      } catch (syncError) {
        console.error('Sync error (non-fatal):', syncError);
      }
    } catch (error) {
      console.error('Error saving generated address:', error);
    }
  }

  async updateAddressCount(increment: number = 1): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['user_data', 'accounts', 'currentAccount']);
      const userData = result.user_data;
      
      if (!userData) {
        return;
      }

      const currentLocalCount = userData.stats.addresses_generated || 0;
      const syncedCount = await this.syncService.syncTotalCount(currentLocalCount);
      const newCount = syncedCount + increment;
      
      userData.stats.addresses_generated = newCount;
      await chrome.storage.local.set({ user_data: userData });
      await this.syncService.syncTotalCount(newCount);

      const username = userData.user?.username;
      if (username && result.accounts && result.currentAccount === username) {
        const accounts = result.accounts;
        const updatedAccounts = accounts.map((acc: any) => {
          if (acc.username === username) {
            return {
              ...acc,
              userData: {
                ...acc.userData,
                stats: {
                  ...acc.userData.stats,
                  addresses_generated: newCount
                }
              }
            };
          }
          return acc;
        });

        await chrome.storage.local.set({ accounts: updatedAccounts });
      }
    } catch (error) {
      console.error('Error updating address count:', error);
    }
  }

  async getAddresses(): Promise<Address[]> {
    try {
      const username = await this.getCurrentUsername();
      if (!username) {
        return [];
      }

      const accountKey = `addresses_${username}`;
      
      const syncAddresses = await this.syncService.getAddressesFromSync(username);
      if (syncAddresses !== null && syncAddresses.length > 0) {
        await chrome.storage.local.set({ [accountKey]: syncAddresses });
        
        const userData = await this.getUserData();
        if (userData?.stats?.addresses_generated !== undefined) {
          const syncedCount = await this.syncService.syncTotalCount(userData.stats.addresses_generated);
          if (syncedCount !== userData.stats.addresses_generated) {
            userData.stats.addresses_generated = syncedCount;
            await chrome.storage.local.set({ user_data: userData });
            
            const result = await chrome.storage.local.get(['accounts', 'currentAccount']);
            if (result.accounts && result.currentAccount === username) {
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
        
        return syncAddresses;
      }

      const accountResult = await chrome.storage.local.get(accountKey);
      const accountAddresses = accountResult[accountKey] || [];
      
      if (accountAddresses.length > 0) {
        return accountAddresses;
      }

      const globalResult = await chrome.storage.local.get('generated_addresses');
      const globalAddresses = globalResult.generated_addresses || [];

      const filteredAddresses = globalAddresses.filter((addr: Address) => 
        !addr.username || addr.username === username
      );

      if (filteredAddresses.length > 0) {
        await chrome.storage.local.set({
          [accountKey]: filteredAddresses
        });
        
        const remainingAddresses = globalAddresses.filter((addr: Address) => 
          addr.username && addr.username !== username
        );

        await chrome.storage.local.set({ 
          generated_addresses: remainingAddresses 
        });
      }
      
      return filteredAddresses;
    } catch (error) {
      console.error('Error getting addresses:', error);
      return [];
    }
  }

  async updateAddressNotes(addressValue: string, notes: string): Promise<boolean> {
    try {
      const username = await this.getCurrentUsername();
      if (!username) {
        return false;
      }

      const accountKey = `addresses_${username}`;
      const accountResult = await chrome.storage.local.get(accountKey);
      const accountAddresses = accountResult[accountKey] || [];
      
      const updatedAccountAddresses = accountAddresses.map((addr: Address) => {
        if (addr.value === addressValue) {
          return { ...addr, notes, lastModified: Date.now() };
        }
        return addr;
      });
      
      await chrome.storage.local.set({ [accountKey]: updatedAccountAddresses });

      const globalResult = await chrome.storage.local.get('generated_addresses');
      const globalAddresses = globalResult.generated_addresses || [];
      
      const updatedGlobalAddresses = globalAddresses.map((addr: Address) => {
        if (addr.value === addressValue && addr.username === username) {
          return { ...addr, notes, lastModified: Date.now() };
        }
        return addr;
      });
      
      await chrome.storage.local.set({ generated_addresses: updatedGlobalAddresses });

      try {
        await this.syncService.saveAddressesToSync(username, updatedAccountAddresses);
      } catch (syncError) {
        console.error('Sync error (non-fatal):', syncError);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating address notes:', error);
      return false;
    }
  }

  async updateAddressTags(addressValue: string, tags: string[]): Promise<boolean> {
    try {
      const username = await this.getCurrentUsername();
      if (!username) {
        return false;
      }

      const accountKey = `addresses_${username}`;
      const accountResult = await chrome.storage.local.get(accountKey);
      const accountAddresses = accountResult[accountKey] || [];

      const updatedAccountAddresses = accountAddresses.map((addr: Address) => {
        if (addr.value === addressValue) {
          return { ...addr, tags, lastModified: Date.now() };
        }
        return addr;
      });

      await chrome.storage.local.set({ [accountKey]: updatedAccountAddresses });

      const globalResult = await chrome.storage.local.get('generated_addresses');
      const globalAddresses = globalResult.generated_addresses || [];

      const updatedGlobalAddresses = globalAddresses.map((addr: Address) => {
        if (addr.value === addressValue && addr.username === username) {
          return { ...addr, tags, lastModified: Date.now() };
        }
        return addr;
      });

      await chrome.storage.local.set({ generated_addresses: updatedGlobalAddresses });

      try {
        await this.syncService.saveAddressesToSync(username, updatedAccountAddresses);
      } catch (syncError) {
        console.error('Sync error (non-fatal):', syncError);
      }

      return true;
    } catch (error) {
      console.error('Error updating address tags:', error);
      return false;
    }
  }

  async deleteAddress(addressValue: string): Promise<boolean> {
    try {
      const username = await this.getCurrentUsername();
      if (!username) {
        return false;
      }

      const accountKey = `addresses_${username}`;
      const accountResult = await chrome.storage.local.get(accountKey);
      const accountAddresses = accountResult[accountKey] || [];
      
      const filteredAccountAddresses = accountAddresses.filter((addr: Address) => 
        addr.value !== addressValue
      );
      
      await chrome.storage.local.set({ [accountKey]: filteredAccountAddresses });

      const globalResult = await chrome.storage.local.get('generated_addresses');
      const globalAddresses = globalResult.generated_addresses || [];
      
      const filteredGlobalAddresses = globalAddresses.filter((addr: Address) => 
        !(addr.value === addressValue && addr.username === username)
      );
      
      await chrome.storage.local.set({ generated_addresses: filteredGlobalAddresses });

      try {
        await this.syncService.saveAddressesToSync(username, filteredAccountAddresses);
      } catch (syncError) {
        console.error('Sync error (non-fatal):', syncError);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      return false;
    }
  }

  async clearAllAddresses(): Promise<boolean> {
    try {
      const username = await this.getCurrentUsername();
      if (!username) {
        return false;
      }

      const accountKey = `addresses_${username}`;
      await chrome.storage.local.set({ [accountKey]: [] });

      const globalResult = await chrome.storage.local.get('generated_addresses');
      const globalAddresses = globalResult.generated_addresses || [];
      
      const filteredGlobalAddresses = globalAddresses.filter((addr: Address) => 
        addr.username !== username
      );
      
      await chrome.storage.local.set({ generated_addresses: filteredGlobalAddresses });

      await this.updateAddressCount(0);

      try {
        await this.syncService.saveAddressesToSync(username, []);
      } catch (syncError) {
        console.error('Sync error (non-fatal):', syncError);
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing all addresses:', error);
      return false;
    }
  }

  async clearStorage(): Promise<void> {
    await chrome.storage.local.clear();
  }

  async getHideUserInfo(): Promise<boolean> {
    const result = await chrome.storage.local.get('hide_user_info');
    return result.hide_user_info || false;
  }

  async setHideUserInfo(hide: boolean): Promise<void> {
    await chrome.storage.local.set({ hide_user_info: hide });
  }

  async getHideGeneratedAddresses(): Promise<boolean> {
    const result = await chrome.storage.local.get('hide_generated_addresses');
    return result.hide_generated_addresses || false;
  }

  async setHideGeneratedAddresses(hide: boolean): Promise<void> {
    await chrome.storage.local.set({ hide_generated_addresses: hide });
  }

  async saveReverseAlias(recipientEmail: string, alias: string, notes?: string): Promise<void> {
    try {
      const username = await this.getCurrentUsername();
      if (!username) throw new Error('User data not found');

      const key = `reverse_aliases_${username}`;
      const result = await chrome.storage.local.get(key);
      const existing: ReverseAlias[] = result[key] || [];

      const duplicateIndex = existing.findIndex(a => a.recipientEmail === recipientEmail);
      if (duplicateIndex !== -1) {
        const updated = { ...existing[duplicateIndex], alias, timestamp: Date.now(), lastModified: Date.now() };
        const filtered = existing.filter((_, i) => i !== duplicateIndex);
        const updatedList = [updated, ...filtered];
        await chrome.storage.local.set({ [key]: updatedList });

        try {
          await this.syncService.saveReverseAliasesToSync(username, updatedList);
        } catch (syncError) {
          console.error('Sync error (non-fatal):', syncError);
        }
        return;
      }

      const newAlias: ReverseAlias = {
        recipientEmail,
        alias,
        timestamp: Date.now(),
        lastModified: Date.now(),
        notes: notes || '',
        username
      };

      const updated = [newAlias, ...existing];
      await chrome.storage.local.set({ [key]: updated });

      try {
        await this.syncService.saveReverseAliasesToSync(username, updated);
      } catch (syncError) {
        console.error('Sync error (non-fatal):', syncError);
      }
    } catch (error) {
      console.error('Error saving reverse alias:', error);
    }
  }

  async getReverseAliases(): Promise<ReverseAlias[]> {
    try {
      const username = await this.getCurrentUsername();
      if (!username) return [];

      const key = `reverse_aliases_${username}`;

      const syncAliases = await this.syncService.getReverseAliasesFromSync(username);
      if (syncAliases !== null && syncAliases.length > 0) {
        await chrome.storage.local.set({ [key]: syncAliases });
        return syncAliases as ReverseAlias[];
      }

      const result = await chrome.storage.local.get(key);
      return result[key] || [];
    } catch (error) {
      console.error('Error getting reverse aliases:', error);
      return [];
    }
  }

  async updateReverseAliasNotes(recipientEmail: string, notes: string): Promise<boolean> {
    try {
      const username = await this.getCurrentUsername();
      if (!username) return false;

      const key = `reverse_aliases_${username}`;
      const result = await chrome.storage.local.get(key);
      const aliases: ReverseAlias[] = result[key] || [];

      const updated = aliases.map(a =>
        a.recipientEmail === recipientEmail
          ? { ...a, notes, lastModified: Date.now() }
          : a
      );

      await chrome.storage.local.set({ [key]: updated });

      try {
        await this.syncService.saveReverseAliasesToSync(username, updated);
      } catch (syncError) {
        console.error('Sync error (non-fatal):', syncError);
      }

      return true;
    } catch (error) {
      console.error('Error updating reverse alias notes:', error);
      return false;
    }
  }

  async updateReverseAliasTags(recipientEmail: string, tags: string[]): Promise<boolean> {
    try {
      const username = await this.getCurrentUsername();
      if (!username) return false;

      const key = `reverse_aliases_${username}`;
      const result = await chrome.storage.local.get(key);
      const aliases: ReverseAlias[] = result[key] || [];

      const updated = aliases.map(a =>
        a.recipientEmail === recipientEmail
          ? { ...a, tags, lastModified: Date.now() }
          : a
      );

      await chrome.storage.local.set({ [key]: updated });

      try {
        await this.syncService.saveReverseAliasesToSync(username, updated);
      } catch (syncError) {
        console.error('Sync error (non-fatal):', syncError);
      }

      return true;
    } catch (error) {
      console.error('Error updating reverse alias tags:', error);
      return false;
    }
  }

  async deleteReverseAlias(recipientEmail: string): Promise<boolean> {
    try {
      const username = await this.getCurrentUsername();
      if (!username) return false;

      const key = `reverse_aliases_${username}`;
      const result = await chrome.storage.local.get(key);
      const aliases: ReverseAlias[] = result[key] || [];

      const filtered = aliases.filter(a => a.recipientEmail !== recipientEmail);
      await chrome.storage.local.set({ [key]: filtered });

      try {
        await this.syncService.saveReverseAliasesToSync(username, filtered);
      } catch (syncError) {
        console.error('Sync error (non-fatal):', syncError);
      }

      return true;
    } catch (error) {
      console.error('Error deleting reverse alias:', error);
      return false;
    }
  }

  async clearAllReverseAliases(): Promise<boolean> {
    try {
      const username = await this.getCurrentUsername();
      if (!username) return false;

      const key = `reverse_aliases_${username}`;
      await chrome.storage.local.set({ [key]: [] });

      try {
        await this.syncService.saveReverseAliasesToSync(username, []);
      } catch (syncError) {
        console.error('Sync error (non-fatal):', syncError);
      }

      return true;
    } catch (error) {
      console.error('Error clearing reverse aliases:', error);
      return false;
    }
  }

  async getHideReverseAliases(): Promise<boolean> {
    const result = await chrome.storage.local.get('hide_reverse_aliases');
    return result.hide_reverse_aliases || false;
  }

  async setHideReverseAliases(hide: boolean): Promise<void> {
    await chrome.storage.local.set({ hide_reverse_aliases: hide });
  }
}