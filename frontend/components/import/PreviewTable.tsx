"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useImportStore } from '../../store/importStore';
import { importCsv } from '../../lib/api';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/helpers';

export default function PreviewTable() {
  const { rows, setProcessing, setResult, setError, setProgress, reset } = useImportStore();
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const preview = rows.slice(0, 10);

  const handleConfirm = async () => {
    setProcessing();
    try {
      setProgress(`Processing ${rows.length} rows with AI...`);
      const result = await importCsv(rows);
      setResult(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Import failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-extrabold text-gray-900">Preview</h3>
          <p className="text-[13px] text-gray-400 mt-0.5">
            <span className="font-bold text-gray-700">{rows.length}</span> rows · {headers.length} columns
            {rows.length > 10 && <span className="text-gray-400"> (showing first 10)</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.96 }} onClick={reset}
            className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:border-gray-300 transition-colors cursor-pointer bg-white">
            Choose another file
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-700 transition-colors cursor-pointer">
            Confirm Import
          </motion.button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="overflow-auto max-h-[420px]">
          <table className="w-full border-collapse text-[13px]">
            <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10">
              <tr className="border-b border-gray-100">
                {headers.map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <motion.tbody variants={STAGGER_CONTAINER} initial="initial" animate="animate">
              {preview.map((row, i) => (
                <motion.tr key={i} variants={STAGGER_ITEM} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/20 transition-colors">
                  {headers.map(h => (
                    <td key={h} className="px-4 py-3 text-gray-700 whitespace-nowrap max-w-[200px] truncate" title={String(row[h] ?? '')}>
                      {String(row[h] ?? '')}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
        {rows.length > 10 && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[12px] text-gray-400 text-center font-medium">
            + {rows.length - 10} more rows not shown
          </div>
        )}
      </div>
    </div>
  );
}
