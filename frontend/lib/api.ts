import type { ImportResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function importCsv(rows: Record<string, string>[]): Promise<ImportResponse> {
  const res = await fetch(`${API_URL}/api/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error((err as { error?: { message?: string } }).error?.message || 'Import failed');
  }
  return res.json() as Promise<ImportResponse>;
}
