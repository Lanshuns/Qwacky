import { t } from '../i18n/core'

export class AuthService {
  private headers: Record<string, string>

  constructor() {
    this.headers = {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
    }
  }

  async requestOTP(username: string) {
    try {
      const url = new URL('https://quack.duckduckgo.com/api/auth/loginlink');
      url.searchParams.set('user', username);
      const response = await fetch(
        url.toString(),
        { headers: this.headers }
      )
      if (response.ok) {
        return { status: 'success', needs_otp: true, message: t('error.otpSent') }
      }
      if (response.status === 429) {
        return { status: 'error', message: t('error.tooManyRequests') }
      }
      return { status: 'error', message: t('error.otpSendFailed') }
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return { status: 'error', message: t('error.network') }
      }
      return { status: 'error', message: error instanceof Error ? error.message : t('common.unknownError') }
    }
  }

  async verifyOTP(username: string, otp: string) {
    try {
      const url = new URL('https://quack.duckduckgo.com/api/auth/login');
      url.searchParams.set('otp', otp);
      url.searchParams.set('user', username);
      const loginResponse = await fetch(
        url.toString(),
        { headers: this.headers }
      )
      if (loginResponse.status === 429) {
        return { status: 'error', message: t('error.tooManyRequests') }
      }
      if (!loginResponse.ok) {
        return { status: 'error', message: t('error.loginFailed') }
      }

      let loginData;
      try {
        loginData = await loginResponse.json();
      } catch {
        return { status: 'error', message: t('error.invalidServerResponse') };
      }

      if ('token' in loginData) {
        const headers = { ...this.headers, authorization: `Bearer ${loginData.token}` }
        const dashboardResponse = await fetch(
          'https://quack.duckduckgo.com/api/email/dashboard',
          { headers }
        )

        if (!dashboardResponse.ok) {
          return { status: 'error', message: t('error.dashboardFailed') }
        }

        let dashboardData;
        try {
          dashboardData = await dashboardResponse.json();
        } catch {
          return { status: 'error', message: t('error.invalidServerResponse') };
        }

        return {
          status: 'success',
          dashboard: dashboardData,
          access_token: loginData.token,
          message: t('error.loginSuccessful')
        }
      }
      
      return { status: 'error', message: t('error.invalidPassphrase') }
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return { status: 'error', message: t('error.network') }
      }
      return { status: 'error', message: error instanceof Error ? error.message : t('common.unknownError') }
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
        throw new Error(t('error.generateFailed'))
      }
      
      let data;
      try {
        data = await response.json();
      } catch {
        return { status: 'error', message: t('error.invalidServerResponse') };
      }
      if (data.address) {
        return { 
          status: 'success', 
          address: data.address 
        }
      }
      throw new Error(t('error.invalidResponseFormat'))
    } catch (error) {
      return { 
        status: 'error', 
        message: error instanceof Error ? error.message : t('common.unknownError') 
      }
    }
  }
} 