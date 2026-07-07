"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BookmarkCheck, ChevronRight, Mail, Phone, Building2, MapPin } from 'lucide-react';
import Link from 'next/link';
import AvatarInitials from '../ui/AvatarInitials';
import type { ImportResponse, CrmRecord } from '../../lib/types';
import { STORAGE_KEYS } from '../../lib/helpers';
import { useImportStore } from '../../store/importStore';
import SaveDialog from './SaveDialog';
import LeadDetailDrawer from './LeadDetailDrawer';
import type { SavedImport } from '../../lib/types';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  GOOD_LEAD_FOLLOW_UP: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400' },
  DID_NOT_CONNECT:     { bg: 'bg-amber-50 dark:bg-amber-500/10',     text: 'text-amber-700 dark:text-amber-400' },
  BAD_LEAD:            { bg: 'bg-red-50 dark:bg-red-500/10',         text: 'text-red-700 dark:text-red-400' },
  SALE_DONE:           { bg: 'bg-blue-50 dark:bg-blue-500/10',       text: 'text-blue-700 dark:text-blue-400' },
};
const STATUS_LABELS: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: 'Follow Up',
  DID_NOT_CONNECT:     'Did Not Connect',
  BAD_LEAD:            'Bad Lead',
  SALE_DONE:           'Sale Done',
};

export default function ResultTable({ result }: { result: ImportResponse }) {
  const [showSkipped, setShowSkipped]       = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savedName, setSavedName]           = useState<string | null>(null);
  const [drawerRecord, setDrawerRecord]     = useState<CrmRecord | null>(null);
  const { reset, file } = useImportStore();

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
    } catch { /* ignore */ }
    setSavedName(name);
    setShowSaveDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[20px] font-black text-gray-900 dark:text-gray-100 mb-1">Import Complete</h2>
          <p className="text-[13px] text-gray-500 dark:text-gray-400">Your leads have been mapped to the GrowEasy CRM schema.</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {savedName ? (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <BookmarkCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400">Saved as &ldquo;{savedName}&rdquo;</span>
              <Link href="/leads" className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-700">View Leads →</Link>
            </div>
          ) : (
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowSaveDialog(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-sm">
              Save Import
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.96 }} onClick={reset}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-[13px] font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer bg-white dark:bg-[#13151c]">
            Import another
          </motion.button>
        </div>
      </div>

      {/* Imported records table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-extrabold text-gray-900 dark:text-gray-100">
            Imported Records
            <span className="ml-2 text-[13px] font-bold text-gray-400 dark:text-gray-500">({result.imported.length})</span>
          </h3>
          <p className="text-[12px] text-gray-400 dark:text-gray-500 font-medium">Click any row to view full details</p>
        </div>

        <div className="bg-white dark:bg-[#13151c] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm" style={{ boxShadow: 'var(--shadow-card)' }}>
          {/* Table header */}
          <div className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr_1fr_1.2fr_40px] bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
            {['Name', 'Email', 'Phone', 'Company', 'City', 'Status', ''].map((col) => (
              <div key={col} className="px-4 py-3 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest first:pl-4">
                {col}
              </div>
            ))}
          </div>

          {/* Scrollable rows */}
          <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-[520px] overflow-y-auto">
            {result.imported.map((rec, i) => {
              const phone = [rec.country_code, rec.mobile_without_country_code].filter(Boolean).join(' ');
              const statusStyle = rec.crm_status ? STATUS_COLORS[rec.crm_status] : null;
              return (
                <div
                  key={i}
                  onClick={() => setDrawerRecord(rec)}
                  className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr_1fr_1.2fr_40px] items-center hover:bg-blue-50/40 dark:hover:bg-blue-500/5 transition-colors cursor-pointer group"
                >
                  {/* Name */}
                  <div className="px-4 py-3 flex items-center gap-2.5 min-w-0">
                    <AvatarInitials name={rec.name} size="sm" className="shrink-0" />
                    <span className="text-[13px] font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {rec.name || '—'}
                    </span>
                  </div>
                  {/* Email */}
                  <div className="px-4 py-3 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Mail size={11} className="text-gray-300 dark:text-gray-600 shrink-0" />
                      <span className="text-[12.5px] text-gray-500 dark:text-gray-400 truncate">{rec.email || '—'}</span>
                    </div>
                  </div>
                  {/* Phone */}
                  <div className="px-4 py-3 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Phone size={11} className="text-gray-300 dark:text-gray-600 shrink-0" />
                      <span className="text-[12.5px] text-gray-500 dark:text-gray-400 truncate">{phone || '—'}</span>
                    </div>
                  </div>
                  {/* Company */}
                  <div className="px-4 py-3 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={11} className="text-gray-300 dark:text-gray-600 shrink-0" />
                      <span className="text-[12.5px] font-semibold text-gray-700 dark:text-gray-300 truncate">{rec.company || '—'}</span>
                    </div>
                  </div>
                  {/* City */}
                  <div className="px-4 py-3 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={11} className="text-gray-300 dark:text-gray-600 shrink-0" />
                      <span className="text-[12.5px] text-gray-500 dark:text-gray-400 truncate">{rec.city || '—'}</span>
                    </div>
                  </div>
                  {/* Status */}
                  <div className="px-4 py-3">
                    {statusStyle && rec.crm_status ? (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap ${statusStyle.bg} ${statusStyle.text}`}>
                        {STATUS_LABELS[rec.crm_status] || rec.crm_status.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-[12px]">—</span>
                    )}
                  </div>
                  {/* Arrow */}
                  <div className="flex items-center justify-center">
                    <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>

          {result.imported.length > 8 && (
            <div className="px-4 py-2.5 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 text-center">
              <p className="text-[11.5px] text-gray-400 dark:text-gray-500 font-medium">
                {result.imported.length} records total · scroll to browse all · click any row for full details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Skipped rows */}
      {result.skipped.length > 0 && (
        <div>
          <button onClick={() => setShowSkipped(s => !s)}
            className="flex items-center gap-2 text-[14px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors mb-3 cursor-pointer">
            {showSkipped ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Skipped Rows ({result.skipped.length})
          </button>
          <AnimatePresence>
            {showSkipped && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-[#13151c] rounded-2xl border border-amber-200 dark:border-amber-500/20 overflow-hidden shadow-sm" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {result.skipped.map((s, i) => (
                    <div key={i} className="px-4 py-3 flex items-start gap-3">
                      <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pt-0.5 shrink-0">Row {s.rowIndex + 1}</span>
                      <span className="text-[12.5px] text-amber-600 dark:text-amber-400 font-medium">{s.reason}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showSaveDialog && <SaveDialog defaultName={defaultName} onSave={handleSave} onClose={() => setShowSaveDialog(false)} />}
      </AnimatePresence>

      <LeadDetailDrawer record={drawerRecord} open={!!drawerRecord} onClose={() => setDrawerRecord(null)} />
    </div>
  );
}
