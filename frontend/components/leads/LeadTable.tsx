"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowUpDown, Mail, Building2, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import AvatarInitials from '../ui/AvatarInitials';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/helpers';
import type { CrmRecord } from '../../lib/types';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  GOOD_LEAD_FOLLOW_UP: { bg: '#f0fdf4', text: '#15803d' },
  SALE_DONE:           { bg: '#eff6ff', text: '#1d4ed8' },
  DID_NOT_CONNECT:     { bg: '#fdf4ff', text: '#7c3aed' },
  BAD_LEAD:            { bg: '#fff1f2', text: '#be123c' },
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
}

export default function LeadTable({ records, sortField, sortDir, onSort }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {COLUMNS.map(col => {
                const isActive = sortField === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && onSort(col.key)}
                    className={clsx(
                      'text-[11.5px] font-bold text-gray-400 uppercase tracking-widest py-3 px-4 text-left select-none',
                      col.sortable && 'cursor-pointer group hover:text-gray-600 transition-colors',
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && (
                        isActive
                          ? <motion.span animate={{ rotate: sortDir === 'desc' ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-blue-500"><ArrowUp size={12} strokeWidth={3} /></motion.span>
                          : <ArrowUpDown size={12} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
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
                  key={i}
                  variants={STAGGER_ITEM}
                  className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <AvatarInitials name={rec.name} size="sm" className="rounded-lg shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-bold text-gray-900 truncate leading-none">{rec.name || '—'}</p>
                        {rec.lead_owner && (
                          <p className="text-[11.5px] text-gray-400 mt-1 truncate">{rec.lead_owner}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" />
                      <span className="text-[13px] text-gray-600 truncate">{rec.email || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{phone || '—'}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <Building2 size={12} />
                      </div>
                      <span className="text-[13px] font-semibold text-gray-700 truncate max-w-[140px]">{rec.company || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{rec.city || '—'}</td>
                  <td className="px-4 py-3.5">
                    {statusColor && rec.crm_status ? (
                      <span
                        className="text-[10.5px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                      >
                        {rec.crm_status.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="text-[13px] text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors ml-auto" />
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
