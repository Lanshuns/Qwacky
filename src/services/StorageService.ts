import { UserData } from '../types';

interface Address {
  value: string;
  timestamp: number;
  notes?: string;
  username?: string;
}

export class StorageService {
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
        notes: notes || '',
        username: username
      };

      const accountKey = `addresses_${username}`;
      const accountResult = await chrome.storage.local.get(accountKey);
      const accountAddresses = accountResult[accountKey] || [];
      
      await chrome.storage.local.set({
        [accountKey]: [newAddress, ...accountAddresses]
      });

      const globalResult = await chrome.storage.local.get('generated_addresses');
      const globalAddresses = globalResult.generated_addresses || [];

      const otherUserAddresses = globalAddresses.filter((addr: Address) => 
        !addr.username || addr.username !== username
      );
      
      await chrome.storage.local.set({
        generated_addresses: [newAddress, ...otherUserAddresses]
      });
    } catch (error) {
      console.error('Error saving generated address:', error);
    }
  }

  async updateAddressCount(count: number): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['user_data', 'accounts', 'currentAccount']);
      const userData = result.user_data;
      
      if (!userData) {
        return;
      }
      userData.stats.addresses_generated = count;
      await chrome.storage.local.set({ user_data: userData });

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
                  addresses_generated: count
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
          return { ...addr, notes };
        }
        return addr;
      });
      
      await chrome.storage.local.set({ [accountKey]: updatedAccountAddresses });

      const globalResult = await chrome.storage.local.get('generated_addresses');
      const globalAddresses = globalResult.generated_addresses || [];
      
      const updatedGlobalAddresses = globalAddresses.map((addr: Address) => {
        if (addr.value === addressValue && addr.username === username) {
          return { ...addr, notes };
        }
        return addr;
      });
      
      await chrome.storage.local.set({ generated_addresses: updatedGlobalAddresses });
      
      return true;
    } catch (error) {
      console.error('Error updating address notes:', error);
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
}