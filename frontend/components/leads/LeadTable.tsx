"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowUpDown, Mail, Building2, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import AvatarInitials from '../ui/AvatarInitials';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/helpers';
import type { CrmRecord } from '../../lib/types';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  GOOD_LEAD_FOLLOW_UP: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400' },
  SALE_DONE:           { bg: 'bg-blue-50 dark:bg-blue-500/10',       text: 'text-blue-700 dark:text-blue-400' },
  DID_NOT_CONNECT:     { bg: 'bg-violet-50 dark:bg-violet-500/10',   text: 'text-violet-700 dark:text-violet-400' },
  BAD_LEAD:            { bg: 'bg-red-50 dark:bg-red-500/10',         text: 'text-red-700 dark:text-red-400' },
};

const COLUMNS = [
  { key: 'name',       label: 'Name',    sortable: true },
  { key: 'email',      label: 'Email',   sortable: true },
  { key: 'phone',      label: 'Phone',   sortable: false },
  { key: 'company',    label: 'Company', sortable: true },
  { key: 'city',       label: 'City',    sortable: false },
  { key: 'crm_status', label: 'Status',  sortable: false },
];

interface Props {
  records: CrmRecord[];
  sortField: string;
  sortDir: string;
  onSort: (field: string) => void;
  onRowClick?: (record: CrmRecord) => void;
}

export default function LeadTable({ records, sortField, sortDir, onSort, onRowClick }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#13151c]" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
              {COLUMNS.map(col => {
                const isActive = sortField === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && onSort(col.key)}
                    className={clsx(
                      'select-none px-4 py-3 text-left text-[11.5px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500',
                      col.sortable && 'cursor-pointer group transition-colors hover:text-gray-700 dark:hover:text-gray-300',
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && (
                        isActive
                          ? <motion.span animate={{ rotate: sortDir === 'desc' ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-blue-500"><ArrowUp size={12} strokeWidth={3} /></motion.span>
                          : <ArrowUpDown size={12} className="text-gray-300 dark:text-gray-600 transition-colors group-hover:text-gray-500 dark:group-hover:text-gray-400" />
                      )}
                    </div>
                  </th>
                );
              })}
              <th className="w-12" />
            </tr>
          </thead>
          <motion.tbody variants={STAGGER_CONTAINER} initial="initial" animate="animate">
            {records.map((rec, i) => {
              const phone = [rec.country_code, rec.mobile_without_country_code].filter(Boolean).join(' ');
              const statusColor = rec.crm_status ? STATUS_COLORS[rec.crm_status] : null;
              return (
                <motion.tr
                  key={`${rec.email}-${i}`}
                  variants={STAGGER_ITEM}
                  onClick={() => onRowClick?.(rec)}
                  className={clsx(
                    'group border-b border-gray-50 dark:border-white/5 transition-colors last:border-0 hover:bg-blue-50/50 dark:hover:bg-blue-500/5',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <AvatarInitials name={rec.name} size="sm" className="shrink-0 rounded-lg" />
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-bold leading-none text-gray-900 dark:text-gray-100">{rec.name || '—'}</p>
                        {rec.lead_owner && (
                          <p className="mt-1 truncate text-[11.5px] text-gray-400 dark:text-gray-500">{rec.lead_owner}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="shrink-0 text-gray-300 dark:text-gray-600 transition-colors group-hover:text-blue-400" />
                      <span className="truncate text-[13px] text-gray-500 dark:text-gray-400">{rec.email || '—'}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-[13px] text-gray-500 dark:text-gray-400">{phone || '—'}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-500">
                        <Building2 size={12} />
                      </div>
                      <span className="max-w-[140px] truncate text-[13px] font-semibold text-gray-700 dark:text-gray-300">{rec.company || '—'}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-[13px] text-gray-500 dark:text-gray-400">{rec.city || '—'}</td>
                  <td className="px-4 py-3.5">
                    {statusColor && rec.crm_status ? (
                      <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-bold ${statusColor.bg} ${statusColor.text}`}>
                        {rec.crm_status.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="text-[13px] text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <ChevronRight size={16} className="ml-auto text-gray-300 dark:text-gray-600 transition-colors group-hover:text-blue-400" />
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
