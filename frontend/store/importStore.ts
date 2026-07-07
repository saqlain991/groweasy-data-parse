"use client";
import { create } from 'zustand';
import type { ImportResponse } from '../lib/types';
import type { StreamProgress } from '../hooks/useImportStream';

type FlowState = 'idle' | 'previewing' | 'processing' | 'done' | 'error';

interface ImportStore {
  step: FlowState;
  file: File | null;
  rows: Record<string, string>[];
  result: ImportResponse | null;
  error: string | null;
  progress: string | null;
  streamProgress: StreamProgress | null;
  setFile: (file: File) => void;
  setRows: (rows: Record<string, string>[]) => void;
  setProcessing: () => void;
  setResult: (result: ImportResponse) => void;
  setError: (error: string) => void;
  setProgress: (msg: string) => void;
  setStreamProgress: (p: StreamProgress) => void;
  reset: () => void;
}

export const useImportStore = create<ImportStore>((set) => ({
  step: 'idle',
  file: null,
  rows: [],
  result: null,
  error: null,
  progress: null,
  streamProgress: null,
  setFile: (file) => set({ file }),
  setRows: (rows) => set({ rows, step: 'previewing' }),
  setProcessing: () => set({ step: 'processing', error: null, streamProgress: null }),
  setResult: (result) => set({ result, step: 'done' }),
  setError: (error) => set({ error, step: 'error' }),
  setProgress: (progress) => set({ progress }),
  setStreamProgress: (streamProgress) => set({ streamProgress }),
  reset: () => set({ step: 'idle', file: null, rows: [], result: null, error: null, progress: null, streamProgress: null }),
}));
