"use client";
import { useMemo } from 'react';
import useLocalStorage from './useLocalStorage';
import { STORAGE_KEYS } from '../lib/helpers';
import type { SavedImport, CrmRecord } from '../lib/types';

export interface LeadsData {
  imports: SavedImport[];
  records: CrmRecord[];
  stats: {
    total: number;
    companies: number;
    cities: number;
    sources: number;
  };
}

export function useSavedLeads(): LeadsData {
  const [imports] = useLocalStorage<SavedImport[]>(STORAGE_KEYS.IMPORTS, []);

  return useMemo(() => {
    const records = imports.flatMap(imp => imp.records);
    return {
      imports,
      records,
      stats: {
        total: records.length,
        companies: new Set(records.map(r => r.company).filter(Boolean)).size,
        cities: new Set(records.map(r => r.city).filter(Boolean)).size,
        sources: new Set(records.map(r => r.data_source).filter(Boolean)).size,
      },
    };
  }, [imports]);
}
