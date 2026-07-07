"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowUp, Grid3X3, List } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  sortField: string;
  sortDir: string;
  onSort: (field: string) => void;
  viewMode: string;
  onViewMode: (mode: string) => void;
  resultCount: number;
  totalCount: number;
}

export default function SearchBar({ query, onQueryChange, sortField, sortDir, onSort, viewMode, onViewMode, resultCount, totalCount }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#13151c] p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="group relative flex-1 sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-blue-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by name, email, or company..."
            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#13151c] py-2.5 pl-11 pr-10 text-[14px] font-medium text-gray-900 dark:text-gray-100 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => onQueryChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 dark:text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200"
                type="button"
              >
                <X size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-between gap-2 sm:ml-auto sm:justify-end">
          <div className="flex items-center gap-2">
            <span className="mr-1 hidden text-[12px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 md:block">Sort by</span>
            {['name', 'company'].map((field) => {
              const isActive = sortField === field;
              return (
                <motion.button
                  key={field}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSort(field)}
                  className={clsx(
                    'flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-bold tracking-tight transition-all',
                    isActive
                      ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-500/10 dark:text-blue-300'
                      : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#13151c] text-gray-600 dark:text-gray-300 hover:border-blue-300 hover:text-gray-900 dark:hover:text-gray-100',
                  )}
                  type="button"
                >
                  <span className="capitalize">{field}</span>
                  <motion.span animate={{ rotate: isActive && sortDir === 'desc' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ArrowUp size={12} strokeWidth={3} className={clsx(isActive ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500')} />
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
          <div className="mx-1 hidden h-4 w-px bg-gray-200 dark:bg-white/10 sm:block" />
          <div className="flex rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-1">
            {['grid', 'list'].map((mode) => (
              <motion.button
                key={mode}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewMode(mode)}
                className={clsx(
                  'rounded-lg p-2 transition-all',
                  viewMode === mode
                    ? 'bg-white dark:bg-[#13151c] text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200',
                )}
                type="button"
              >
                {mode === 'grid' ? <Grid3X3 size={16} /> : <List size={16} />}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <p className="text-[13px] font-medium text-gray-400 dark:text-gray-500">
          Showing{' '}
          <motion.span key={resultCount} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="font-bold text-gray-900 dark:text-gray-100">
            {resultCount}
          </motion.span>
          {' '}of {totalCount} leads
          {query && <> for &ldquo;<span className="font-bold text-blue-600 dark:text-blue-300">{query}</span>&rdquo;</>}
        </p>
      </div>
    </div>
  );
}
