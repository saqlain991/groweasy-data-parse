"use client";
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useImportStore } from '../../store/importStore';

const PREVIEW_ROW_H = 40;

interface Props { onConfirm: () => void; }

export default function PreviewTable({ onConfirm }: Props) {
  const { rows, reset } = useImportStore();
  const headers   = rows.length > 0 ? Object.keys(rows[0]) : [];
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => PREVIEW_ROW_H,
    overscan: 10,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-[16px] font-extrabold text-gray-900 dark:text-gray-100">Preview</h3>
          <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5">
            <span className="font-bold text-gray-700 dark:text-gray-300">{rows.length}</span> rows · {headers.length} columns
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.96 }} onClick={reset}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-[13px] font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer bg-white dark:bg-[#13151c]">
            Choose another file
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={onConfirm}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-sm">
            Confirm & Import
          </motion.button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#13151c] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm" style={{ boxShadow: 'var(--shadow-card)' }}>
        {/* Sticky header row */}
        <div className="overflow-x-auto border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
          <div className="flex" style={{ minWidth: headers.length * 160 + 48 }}>
            <div className="w-12 shrink-0 px-3 py-3 text-[10.5px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">#</div>
            {headers.map(h => (
              <div key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap" style={{ width: 160, minWidth: 160 }}>
                {h}
              </div>
            ))}
          </div>
        </div>

        {/* Virtualized body */}
        <div ref={parentRef} style={{ height: Math.min(rows.length * PREVIEW_ROW_H, 380), overflowY: 'auto', overflowX: 'auto' }}>
          <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative', minWidth: headers.length * 160 + 48 }}>
            {rowVirtualizer.getVirtualItems().map(vRow => {
              const row = rows[vRow.index];
              return (
                <div
                  key={vRow.key}
                  style={{ position: 'absolute', top: vRow.start, left: 0, right: 0, height: PREVIEW_ROW_H, minWidth: headers.length * 160 + 48 }}
                  className="flex items-center border-b border-gray-100 dark:border-white/5 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-colors"
                >
                  <span className="w-12 px-3 shrink-0 text-[11px] text-gray-400 dark:text-gray-600 font-mono">{vRow.index + 1}</span>
                  {headers.map(h => (
                    <span
                      key={h}
                      className="px-4 text-[13px] text-gray-600 dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{ width: 160, minWidth: 160 }}
                      title={String(row[h] ?? '')}
                    >
                      {String(row[h] ?? '')}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {rows.length > 20 && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 text-[12px] text-gray-500 dark:text-gray-500 text-center font-medium">
            All {rows.length} rows loaded · scroll to browse
          </div>
        )}
      </div>
    </div>
  );
}
