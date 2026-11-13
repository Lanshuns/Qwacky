export class AuthService {
  private headers: Record<string, string>

  constructor() {
    this.headers = {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
    }
  }

  private async errorWrapper(fn: Function) {
    try {
      return await fn.apply(this);
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return { status: 'error', message: 'Network error. Please check your internet connection.' }
      }
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async requestOTP(username: string) {
    return await this.errorWrapper(async () => {
      const url = new URL('https://quack.duckduckgo.com/api/auth/loginlink');
      url.searchParams.set('user', username);
      const response = await fetch(
        url.toString(),
        { headers: this.headers }
      )
      if (response.ok) {
        return { status: 'success', needs_otp: true, message: 'OTP sent to your email!' }
      }
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment before trying again.');
      }
      throw new Error('Failed to send OTP. Please try again later.');
    })
  }

  async verifyOTP(username: string, otp: string) {
    return await this.errorWrapper(async () => {
      const url = new URL('https://quack.duckduckgo.com/api/auth/login');
      url.searchParams.set('otp', otp);
      url.searchParams.set('user', username);
      const loginResponse = await fetch(
        url.toString(),
        { headers: this.headers }
      )
      if (loginResponse.status === 429) {
        throw new Error('Too many requests. Please wait a moment before trying again.');
      }
      if (!loginResponse.ok) {
        throw new Error('Login failed. Please try again.');
      }

      let loginData;
      try {
        loginData = await loginResponse.json();
      } catch {
        throw new Error('Invalid response from server.' );
      }

      if ('token' in loginData) {
        const headers = { ...this.headers, authorization: `Bearer ${loginData.token}` }
        const dashboardResponse = await fetch(
          'https://quack.duckduckgo.com/api/email/dashboard',
          { headers }
        )

        if (!dashboardResponse.ok) {
          throw new Error('Failed to load dashboard data.');
        }

        let dashboardData;
        try {
          dashboardData = await dashboardResponse.json();
        } catch {
          throw new Error('Invalid response from server.');
        }

        return {
          status: 'success',
          dashboard: dashboardData,
          access_token: loginData.token,
          message: 'Login successful!'
        }
      }

      throw new Error('Invalid passphrase. Please check the passphrase in your email and try again.');
    })
  }

  private async validateResponse(response: Response) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Session expired. Please log in again.');
    }
    if (response.status === 429) {
      throw new Error('Rate limited by DuckDuckGo. Try again later.');
    }
    if (!response.ok) {
      throw new Error(`DuckDuckGo returned error ${response.status}`);
    }
    try {
      return await response.json();
    } catch {
      throw new Error('Invalid response from server.');
    }
  }

  private async apiRequest(endpoint: string | URL | Request, token: string, init: RequestInit) {
    const headers = {
      ...this.headers,
      'authorization': `Bearer ${token}`,
      'content-type': 'application/json'
    }
    const response = await fetch(
      endpoint,
      {
        headers,
        ...init
      }
    )

    return await this.validateResponse(response)
  }

  async generateAddress(token: string) {
    return await this.errorWrapper(async () => {
      const data = await this.apiRequest(
        'https://quack.duckduckgo.com/api/email/addresses',
        token,
        {
          method: 'POST'
        }
      )
      if (data.address) {
        return {
          status: 'success',
          address: data.address
        }
      }
      throw new Error('Invalid response format')
    })
  }

  // https://github.com/duckduckgo/Android/blob/ad37f4116fde864dd1cb3b49e7d4345e0700823f/autofill/autofill-impl/src/main/java/com/duckduckgo/autofill/impl/email/service/DuckAddressStatusManagementService.kt
  // Valid 'active' parameters from testing:
  // active=false active=0
  // active=true active=True active=TrUe active=1
  // Responses from testing:
  // existing GET or PUT: {"active":false}
  // non-existing or non-owning GET: {"error":"not_found"}
  // invalid token GET {"error":"invalid_token"}
  // non-existing or non-owning or main address or invalid token PUT: {"error":"invalid_address_or_access_token"}

  async getActivationStatus(token: string, address: string) {
    return await this.errorWrapper(async () => {
      const url = new URL('https://quack.duckduckgo.com/api/email/addresses');
      url.searchParams.set('address', address);
      const data = await this.apiRequest(
        url,
        token,
        {
          method: 'GET'
        }
      )
      if ('active' in data) {
        return {
          status: 'success',
          active: data.active
        }
      }
      if (data.error) {
        throw new Error(`DuckDuckGo returned error ${data.error}`);
      }
      throw new Error('Invalid response format')
    })
  }

  async setActivationStatus(token: string, address: string, active: boolean) {
    return await this.errorWrapper(async () => {
      const url = new URL('https://quack.duckduckgo.com/api/email/addresses');
      url.searchParams.set('address', address);
      url.searchParams.set('active', active ? "1" : "0");
      const data = await this.apiRequest(
        url,
        token,
        {
          method: 'PUT'
        }
      )
      if ('active' in data) {
        return {
          status: 'success',
          active: data.active
        }
      }
      if (data.error) {
        throw new Error(`DuckDuckGo returned error ${data.error}`);
      }
      throw new Error('Invalid response format')
    })
  }
}
