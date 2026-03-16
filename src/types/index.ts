export interface UserData {
  user: {
    email: string;
    username: string;
    access_token: string;
    cohort: string;
  };
  stats: {
    addresses_generated: number;
  };
  invites: string[];
  addresses: string[];
}

export interface LoginResponse {
  status: string;
  needs_otp?: boolean;
  message: string;
}

export interface VerifyResponse {
  status: string;
  dashboard?: UserData;
  access_token?: string;
  message: string;
}

export interface GenerateResponse {
  status: string;
  address?: string;
  message?: string;
}

export interface ReverseAlias {
  recipientEmail: string;
  alias: string;
  timestamp: number;
  lastModified?: number;
  notes?: string;
  tags?: string[];
  username: string;
}

export interface BackupSummary {
  action: 'export' | 'import';
  accounts: Array<{ username: string; addresses: number; reverseAliases: number }>;
  totalAddresses: number;
  totalReverseAliases: number;
  includesSession: boolean;
  newAddresses?: number;
  newReverseAliases?: number;
  newAccounts?: number;
  skippedAddresses?: number;
  skippedReverseAliases?: number;
}

export interface QwackyBackup {
  version: string;
  type: 'qwacky_backup';
  timestamp: number;
  account: string;
  addresses: Array<{
    value: string;
    timestamp: number;
    notes?: string;
    tags?: string[];
  }>;
  reverseAliases: Array<{
    recipientEmail: string;
    alias: string;
    timestamp: number;
    notes?: string;
    tags?: string[];
  }>;
  session?: {
    currentAccount: string;
    accounts: Array<{
      userData: UserData;
      username: string;
      lastUsed: number;
    }>;
    perAccountData: {
      [username: string]: {
        addresses: any[];
        reverseAliases: ReverseAlias[];
      };
    };
    settings: {
      hideUserInfo: boolean;
      hideGeneratedAddresses: boolean;
      hideReverseAliases: boolean;
      contextMenuEnabled: boolean;
      syncEnabled: boolean;
      themeMode: string;
    };
  };
} 