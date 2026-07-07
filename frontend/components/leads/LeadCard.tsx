"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Building2, Eye } from 'lucide-react';
import AvatarInitials from '../ui/AvatarInitials';
import { getBannerGradient, getBadgeFlags, getCompanyColor, STAGGER_ITEM } from '../../lib/helpers';
import type { CrmRecord } from '../../lib/types';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  GOOD_LEAD_FOLLOW_UP: { bg: '#f0fdf4', text: '#15803d' },
  SALE_DONE:           { bg: '#eff6ff', text: '#1d4ed8' },
  DID_NOT_CONNECT:     { bg: '#f5f3ff', text: '#6d28d9' },
  BAD_LEAD:            { bg: '#fff1f2', text: '#be123c' },
};

interface Props {
  record: CrmRecord;
  index: number;
  onViewDetails?: (record: CrmRecord) => void;
}

export default function LeadCard({ record, index, onViewDetails }: Props) {
  const { isTop, isNew } = getBadgeFlags(index);
  const companyColor = getCompanyColor(record.company);
  const phone = [record.country_code, record.mobile_without_country_code].filter(Boolean).join(' ');
  const location = [record.city, record.state].filter(Boolean).join(', ');
  const statusColor = record.crm_status ? (STATUS_COLORS[record.crm_status] ?? companyColor) : null;

  return (
    <motion.div
      layout
      variants={STAGGER_ITEM}
      whileHover={{ y: -4, boxShadow: '0 20px 48px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.06)', transition: { duration: 0.2, ease: 'easeOut' } }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#13151c]"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Banner */}
      <div className="relative h-[72px] w-full" style={{ background: getBannerGradient(record.name, index) }}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {isTop && <span className="rounded-full border border-white/30 bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">Top</span>}
          {isNew && <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-white">New</span>}
        </div>
      </div>

      {/* Avatar */}
      <div className="relative z-10 mb-2 w-fit px-4 -mt-[22px]">
        <AvatarInitials name={record.name} size="md" className="ring-[3px] ring-white dark:ring-[#13151c]" />
      </div>

      {/* Content — always expanded */}
      <div className="flex flex-1 flex-col px-4 pb-4">
        <h3 className="text-[15px] font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {record.name || '—'}
        </h3>

        {location && (
          <div className="mb-3 mt-1 flex items-center gap-1 text-[12px] font-medium text-gray-400 dark:text-gray-500">
            <MapPin size={11} className="text-gray-300 dark:text-gray-600" />
            <span>{location}</span>
          </div>
        )}
        {(record.crm_note || record.description) && (
          <p className="mb-4 line-clamp-2 text-[12.5px] leading-relaxed text-gray-500 dark:text-gray-400">
            {record.crm_note || record.description}
          </p>
        )}
        <div className="mb-auto flex flex-col gap-1.5">
          {record.email && (
            <div className="flex items-center gap-2 text-[12px] text-gray-400 dark:text-gray-500">
              <Mail size={12} className="text-gray-300 dark:text-gray-600" />
              <span className="truncate">{record.email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-[12px] text-gray-400 dark:text-gray-500">
              <Phone size={12} className="text-gray-300 dark:text-gray-600" />
              <span>{phone}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-50 dark:border-white/5 pt-3">
          {statusColor && record.crm_status && (
            <span
              className="rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-tight"
              style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
            >
              {record.crm_status.replace(/_/g, ' ')}
            </span>
          )}
          {record.company && (
            <span className="flex items-center gap-1.5 rounded-lg border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              <Building2 size={10} className="text-gray-400 dark:text-gray-500" />
              <span className="max-w-[100px] truncate">{record.company}</span>
            </span>
          )}
        </div>
        {onViewDetails && (
          <button
            type="button"
            onClick={() => onViewDetails(record)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-blue-700"
          >
            <Eye size={14} />
            View full details
          </button>
        )}
      </div>
    </motion.div>
  );
}
