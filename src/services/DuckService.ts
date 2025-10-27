import { AuthService } from './AuthService'
import { StorageService } from './StorageService'
import { ImportExportService } from './ImportExportService'
import { LoginResponse, VerifyResponse, GenerateResponse, UserData } from '../types'

export class DuckService {
  private auth: AuthService
  private storage: StorageService
  private importExport: ImportExportService
  
  constructor() {
    this.auth = new AuthService()
    this.storage = new StorageService()
    this.importExport = new ImportExportService()
  }

  async login(username: string): Promise<LoginResponse> {
    try {
      if (!username || typeof username !== 'string' || username.trim() === '') {
        return { status: 'error', message: 'Username is required' }
      }
      
      const response = await this.auth.requestOTP(username)
      return response
    } catch (error: unknown) {
      console.error('Login error:', error)
      return { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'An unexpected error occurred during login' 
      }
    }
  }

  async verifyOTP(username: string, otp: string): Promise<VerifyResponse> {
    try {
      if (!username || typeof username !== 'string' || username.trim() === '') {
        return { status: 'error', message: 'Username is required' }
      }
      
      if (!otp || typeof otp !== 'string' || otp.trim() === '') {
        return { status: 'error', message: 'OTP is required' }
      }
      
      const response = await this.auth.verifyOTP(username, otp)
      if (response.status === 'success' && response.dashboard) {
        await this.storage.saveUserData(response)
        
        if (response.dashboard.user && !response.dashboard.user.username) {
          response.dashboard.user.username = username
        }

      }
      return response
    } catch (error: unknown) {
      console.error('OTP verification error:', error)
      return { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'An unexpected error occurred during verification' 
      }
    }
  }

  async generateAddress(notes?: string): Promise<GenerateResponse> {
    try {
      const userData = await this.storage.getUserData()
      if (!userData) {
        return { status: 'error', message: 'You need to login first' }
      }
      
      if (!userData.user || !userData.user.access_token) {
        return { status: 'error', message: 'Invalid user data. Please log in again.' }
      }
      
      const response = await this.auth.generateAddress(userData.user.access_token)
      if (response.status === 'success') {
        if (!response.address) {
          return { status: 'error', message: 'No address returned from the server' }
        }
        
        await this.storage.saveGeneratedAddress(response.address, notes)

        const latestUserData = await this.storage.getUserData()
        if (latestUserData) {
          await this.storage.updateAddressCount(1)
        }
      }
      return response
    } catch (error: unknown) {
      console.error('Error generating address:', error)
      return { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error generating address'
      }
    }
  }

  async getUserData(): Promise<UserData | null> {
    try {
      return await this.storage.getUserData()
    } catch (error: unknown) {
      console.error('Error getting user data:', error)
      return null
    }
  }

  async logout(): Promise<{ success: boolean, message?: string }> {
    try {
      await this.storage.clearStorage()
      return { success: true }
    } catch (error: unknown) {
      console.error('Error during logout:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error during logout'
      }
    }
  }

  async getAddresses(): Promise<any[]> {
    try {
      return await this.storage.getAddresses()
    } catch (error: unknown) {
      console.error('Error getting addresses:', error)
      return []
    }
  }

  async updateAddressNotes(addressValue: string, notes: string): Promise<boolean> {
    try {
      if (!addressValue) {
        console.error('Cannot update notes: Address value is required')
        return false
      }
      
      return await this.storage.updateAddressNotes(addressValue, notes)
    } catch (error: unknown) {
      console.error('Error updating address notes:', error)
      return false
    }
  }

  async deleteAddress(addressValue: string): Promise<boolean> {
    try {
      if (!addressValue) {
        console.error('Cannot delete address: Address value is required')
        return false
      }
      
      return await this.storage.deleteAddress(addressValue)
    } catch (error: unknown) {
      console.error('Error deleting address:', error)
      return false
    }
  }

  async clearAllAddresses(): Promise<boolean> {
    try {
      return await this.storage.clearAllAddresses()
    } catch (error: unknown) {
      console.error('Error clearing all addresses:', error)
      return false
    }
  }

  async exportAddresses(): Promise<string> {
    try {
      return await this.importExport.exportAddresses()
    } catch (error: unknown) {
      console.error('Error exporting addresses:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to export addresses')
    }
  }

  async exportAddressesCSV(): Promise<string> {
    try {
      return await this.importExport.exportAddressesCSV()
    } catch (error: unknown) {
      console.error('Error exporting addresses to CSV:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to export addresses to CSV')
    }
  }

  async importAddresses(data: string): Promise<{ success: boolean, count: number, error?: string }> {
    try {
      return await this.importExport.importAddresses(data)
    } catch (error: unknown) {
      console.error('Error importing addresses:', error)
      return { 
        success: false, 
        count: 0, 
        error: error instanceof Error ? error.message : 'Unknown error importing addresses'
      }
    }
  }
}