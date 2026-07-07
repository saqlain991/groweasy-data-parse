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
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md group">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by name, email, or company..."
            className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-gray-200 text-[14px] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 bg-white text-gray-900 placeholder:text-gray-400 transition-all font-medium"
          />
          <AnimatePresence>
            {query && (
              <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                whileTap={{ scale: 0.85 }} onClick={() => onQueryChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
                <X size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:ml-auto">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest hidden md:block mr-1">Sort by</span>
            {['name', 'company'].map((field) => {
              const isActive = sortField === field;
              return (
                <motion.button key={field} whileTap={{ scale: 0.95 }} onClick={() => onSort(field)}
                  className={clsx('flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold tracking-tight border transition-all cursor-pointer',
                    isActive ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300')}>
                  <span className="capitalize">{field}</span>
                  <motion.span animate={{ rotate: isActive && sortDir === 'desc' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ArrowUp size={12} strokeWidth={3} className={clsx(isActive ? 'text-blue-500' : 'text-gray-300')} />
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
          <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />
          <div className="flex p-1 bg-gray-100 rounded-xl border border-transparent">
            {['grid', 'list'].map((mode) => (
              <motion.button key={mode} whileTap={{ scale: 0.95 }} onClick={() => onViewMode(mode)}
                className={clsx('p-2 rounded-lg transition-all cursor-pointer',
                  viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600')}>
                {mode === 'grid' ? <Grid3X3 size={16} /> : <List size={16} />}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <p className="text-[13px] text-gray-400 font-medium">
          Showing{' '}
          <motion.span key={resultCount} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="font-bold text-gray-900">
            {resultCount}
          </motion.span>
          {' '}of {totalCount} experts
          {query && <> for &ldquo;<span className="font-bold text-blue-600">{query}</span>&rdquo;</>}
        </p>
      </div>
    </div>
  );
}
