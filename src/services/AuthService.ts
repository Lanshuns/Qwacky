export class AuthService {
  private headers: Record<string, string>

  constructor() {
    this.headers = {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
    }
  }

  async requestOTP(username: string) {
    try {
      const response = await fetch(
        `https://quack.duckduckgo.com/api/auth/loginlink?user=${username}`,
        { headers: this.headers }
      )
      if (response.ok) {
        return { status: 'success', needs_otp: true, message: 'OTP sent to your email!' }
      }
      if (response.status === 429) {
        return { status: 'error', message: 'Too many requests. Please wait a moment before trying again.' }
      }
      return { status: 'error', message: 'Failed to send OTP. Please try again later.' }
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return { status: 'error', message: 'Network error. Please check your internet connection.' }
      }
      return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async verifyOTP(username: string, otp: string) {
    try {
      const loginResponse = await fetch(
        `https://quack.duckduckgo.com/api/auth/login?otp=${otp}&user=${username}`,
        { headers: this.headers }
      )
      if (loginResponse.status === 429) {
        return { status: 'error', message: 'Too many requests. Please wait a moment before trying again.' }
      }
      if (!loginResponse.ok) {
        return { status: 'error', message: 'Login failed. Please try again.' }
      }

      let loginData;
      try {
        loginData = await loginResponse.json();
      } catch {
        return { status: 'error', message: 'Invalid response from server.' };
      }

      if ('token' in loginData) {
        const headers = { ...this.headers, authorization: `Bearer ${loginData.token}` }
        const dashboardResponse = await fetch(
          'https://quack.duckduckgo.com/api/email/dashboard',
          { headers }
        )

        if (!dashboardResponse.ok) {
          return { status: 'error', message: 'Failed to load dashboard data.' }
        }

        let dashboardData;
        try {
          dashboardData = await dashboardResponse.json();
        } catch {
          return { status: 'error', message: 'Invalid response from server.' };
        }

        return {
          status: 'success',
          dashboard: dashboardData,
          access_token: loginData.token,
          message: 'Login successful!'
        }
      }
      
      return { status: 'error', message: 'Invalid passphrase. Please check the passphrase in your email and try again.' }
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return { status: 'error', message: 'Network error. Please check your internet connection.' }
      }
      return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async generateAddress(token: string) {
    try {
      const headers = { 
        ...this.headers, 
        'authorization': `Bearer ${token}`,
        'content-type': 'application/json'
      }
      
      const response = await fetch(
        'https://quack.duckduckgo.com/api/email/addresses',
        { 
          method: 'POST',
          headers
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to generate address')
      }
      
      let data;
      try {
        data = await response.json();
      } catch {
        return { status: 'error', message: 'Invalid response from server.' };
      }
      if (data.address) {
        return { 
          status: 'success', 
          address: data.address 
        }
      }
      throw new Error('Invalid response format')
    } catch (error) {
      return { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
} 