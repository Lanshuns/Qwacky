export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Unknown error';
}

export async function safeSendTabMessage(api: typeof chrome, tabId: number, message: Record<string, unknown>): Promise<void> {
  try {
    await api.tabs.sendMessage(tabId, message);
  } catch {
  }
}
