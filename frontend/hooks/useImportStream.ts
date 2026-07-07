"use client";
import { useCallback, useRef } from 'react';
import type { ImportResponse } from '../lib/types';

export interface StreamProgress {
  totalBatches: number;
  completedBatches: number;
  currentBatch: number;
  isRetrying: boolean;
  importedSoFar: number;
  message: string;
}

interface UseImportStreamOptions {
  onProgress: (p: StreamProgress) => void;
  onDone: (result: ImportResponse) => void;
  onError: (msg: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useImportStream({ onProgress, onDone, onError }: UseImportStreamOptions) {
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(async (rows: Record<string, string>[]) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const state = { totalBatches: 0, completedBatches: 0, importedSoFar: 0 };

    try {
      const res = await fetch(`${API_URL}/api/import/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: { message: 'Stream failed' } }));
        onError((err as { error?: { message?: string } }).error?.message || 'Stream failed');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE lines from buffer
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const lines = part.split('\n');
          let eventName = 'message';
          let dataLine = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) eventName = line.slice(7).trim();
            if (line.startsWith('data: '))  dataLine  = line.slice(6).trim();
          }
          if (!dataLine) continue;

          let payload: Record<string, unknown>;
          try { payload = JSON.parse(dataLine); } catch { continue; }

          if (eventName === 'start') {
            const total = payload.total as number;
            const batchSize = 20;
            state.totalBatches = Math.ceil(total / batchSize);
            onProgress({ totalBatches: state.totalBatches, completedBatches: 0, currentBatch: 0, isRetrying: false, importedSoFar: 0, message: `Starting — ${total} rows in ${state.totalBatches} batch${state.totalBatches > 1 ? 'es' : ''}` });
          }

          if (eventName === 'batch_start') {
            const idx = (payload.batchIndex as number) + 1;
            const total = payload.totalBatches as number;
            state.totalBatches = total;
            onProgress({ ...state, currentBatch: idx, isRetrying: false, message: `Processing batch ${idx} of ${total}…` });
          }

          if (eventName === 'row_fallback') {
            const idx = (payload.batchIndex as number) + 1;
            onProgress({ ...state, currentBatch: idx, isRetrying: true, message: `Batch ${idx} failed — retrying row by row…` });
          }

          if (eventName === 'batch_done') {
            state.completedBatches++;
            state.importedSoFar += payload.imported as number;
            const pct = Math.round((state.completedBatches / state.totalBatches) * 100);
            onProgress({ ...state, currentBatch: payload.batchIndex as number + 1, isRetrying: false, message: `${pct}% — ${state.importedSoFar} leads mapped so far` });
          }

          if (eventName === 'done') {
            onDone(payload as unknown as ImportResponse);
          }

          if (eventName === 'error') {
            onError((payload.message as string) || 'Unknown streaming error');
          }
        }
      }
    } catch (e: unknown) {
      if ((e as Error).name !== 'AbortError') {
        onError(e instanceof Error ? e.message : 'Stream connection failed');
      }
    }
  }, [onProgress, onDone, onError]);

  const abort = useCallback(() => abortRef.current?.abort(), []);

  return { start, abort };
}
