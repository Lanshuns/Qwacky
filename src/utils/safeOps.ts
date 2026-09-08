import { t } from '../i18n/core';

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return t('common.unknownError');
}

export async function safeSendTabMessage(api: typeof chrome, tabId: number, message: Record<string, unknown>): Promise<void> {
  try {
    await api.tabs.sendMessage(tabId, message);
  } catch {
  }
}
