"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BookmarkCheck } from 'lucide-react';
import Link from 'next/link';
import type { ImportResponse } from '../../lib/types';
import { STAGGER_CONTAINER, STAGGER_ITEM, STORAGE_KEYS } from '../../lib/helpers';
import { useImportStore } from '../../store/importStore';
import SaveDialog from './SaveDialog';
import Pagination from '../ui/Pagination';
import type { SavedImport } from '../../lib/types';

const PAGE_SIZE = 15;

const CRM_FIELDS = ['name','email','country_code','mobile_without_country_code','company','city','state','country','lead_owner','crm_status','crm_note','data_source','possession_time','description','created_at'] as const;

export default function ResultTable({ result }: { result: ImportResponse }) {
  const [showSkipped, setShowSkipped] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savedName, setSavedName] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { reset, file } = useImportStore();

  const totalPages = Math.ceil(result.imported.length / PAGE_SIZE);
  const paged = result.imported.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const defaultName = file?.name.replace(/\.csv$/i, '') || `Import ${new Date().toLocaleDateString()}`;

  const handleSave = (name: string) => {
    const newImport: SavedImport = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      savedAt: new Date().toISOString(),
      records: result.imported,
      totals: result.totals,
    };
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.IMPORTS);
      const existing: SavedImport[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(STORAGE_KEYS.IMPORTS, JSON.stringify([...existing, newImport]));
    } catch {
      /* ignore storage errors */
    }
    setSavedName(name);
    setShowSaveDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header row: title + actions on the same line */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[20px] font-black text-gray-900 mb-1">Import Complete</h2>
          <p className="text-[13px] text-gray-400">Your leads have been mapped to the GrowEasy CRM schema.</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {savedName ? (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <BookmarkCheck size={15} className="text-emerald-600" />
              <span className="text-[13px] font-bold text-emerald-700">Saved as &ldquo;{savedName}&rdquo;</span>
              <Link href="/leads" className="text-[13px] font-bold text-emerald-600 underline underline-offset-2 hover:text-emerald-800 transition-colors">
                View Leads →
              </Link>
            </div>
          ) : (
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowSaveDialog(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-700 transition-colors cursor-pointer">
              Save Import
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.96 }} onClick={reset}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer bg-white">
            Import another file
          </motion.button>
        </div>
      </div>

      <div>
        <h3 className="text-[15px] font-extrabold text-gray-900 mb-3">Imported Records ({result.imported.length})</h3>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="overflow-auto max-h-[420px]">
            <table className="w-full border-collapse text-[12.5px]">
              <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10">
                <tr className="border-b border-gray-100">
                  {CRM_FIELDS.map(f => (
                    <th key={f} className="px-3 py-3 text-left text-[10.5px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">{f}</th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={STAGGER_CONTAINER} initial="initial" animate="animate">
                {paged.map((rec, i) => (
                  <motion.tr key={i} variants={STAGGER_ITEM} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                    {CRM_FIELDS.map(f => (
                      <td key={f} className="px-3 py-2.5 text-gray-700 whitespace-nowrap max-w-[160px] truncate" title={String(rec[f] ?? '')}>
                        {f === 'crm_status' && rec[f] ? (
                          <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700">{rec[f]}</span>
                        ) : String(rec[f] ?? '')}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
          <div className="px-4 pb-3">
            <Pagination page={page} totalPages={totalPages} total={result.imported.length} pageSize={PAGE_SIZE} onPage={setPage} />
          </div>
        </div>
      </div>

      {result.skipped.length > 0 && (
        <div>
          <button onClick={() => setShowSkipped(s => !s)}
            className="flex items-center gap-2 text-[14px] font-bold text-amber-600 hover:text-amber-700 transition-colors mb-3 cursor-pointer">
            {showSkipped ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Skipped Rows ({result.skipped.length})
          </button>
          <AnimatePresence>
            {showSkipped && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-2xl border border-amber-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="divide-y divide-gray-50">
                  {result.skipped.map((s, i) => (
                    <div key={i} className="px-4 py-3 flex items-start gap-3">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-0.5 shrink-0">Row {s.rowIndex + 1}</span>
                      <span className="text-[12.5px] text-amber-700 font-medium">{s.reason}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showSaveDialog && (
          <SaveDialog
            defaultName={defaultName}
            onSave={handleSave}
            onClose={() => setShowSaveDialog(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
