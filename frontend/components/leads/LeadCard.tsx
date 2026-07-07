"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Mail, Phone, Building2 } from 'lucide-react';
import AvatarInitials from '../ui/AvatarInitials';
import { getBannerGradient, getBadgeFlags, getCompanyColor, STAGGER_ITEM } from '../../lib/helpers';
import type { CrmRecord } from '../../lib/types';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  GOOD_LEAD_FOLLOW_UP: { bg: '#f0fdf4', text: '#15803d' },
  SALE_DONE:           { bg: '#eff6ff', text: '#1d4ed8' },
  DID_NOT_CONNECT:     { bg: '#fdf4ff', text: '#7c3aed' },
  BAD_LEAD:            { bg: '#fff1f2', text: '#be123c' },
};

interface Props {
  record: CrmRecord;
  index: number;
  isExpanded: boolean;
  onClick?: (record: CrmRecord) => void;
}

export default function LeadCard({ record, index, isExpanded, onClick }: Props) {
  const { isTop, isNew } = getBadgeFlags(index);
  const companyColor = getCompanyColor(record.company);
  const phone = [record.country_code, record.mobile_without_country_code].filter(Boolean).join(' ');
  const location = [record.city, record.state].filter(Boolean).join(', ');
  const statusColor = record.crm_status ? (STATUS_COLORS[record.crm_status] ?? companyColor) : null;

  return (
    <motion.div
      layout
      variants={STAGGER_ITEM}
      whileHover={{ y: -5, boxShadow: '0 24px 64px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)', transition: { duration: 0.2, ease: 'easeOut' } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(record)}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer group flex flex-col"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="h-[72px] relative w-full" style={{ background: getBannerGradient(record.name, index) }}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {isTop && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">Top</span>}
          {isNew && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/90 text-white">New</span>}
        </div>
      </div>
      <div className="px-4 -mt-[22px] mb-2 relative z-10 w-fit">
        <AvatarInitials name={record.name} size="md" className="ring-[3px] ring-white" />
      </div>
      <div className="px-4 pb-4 flex flex-col flex-1">
        <h3 className="text-[15px] font-extrabold text-[#0f1117] tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
          {record.name || '—'}
        </h3>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {location && (
                <div className="flex items-center gap-1 text-[12px] text-gray-400 font-medium mt-1 mb-3">
                  <MapPin size={11} className="text-gray-300" />
                  <span>{location}</span>
                </div>
              )}
              {(record.crm_note || record.description) && (
                <p className="text-[12.5px] text-gray-500 leading-relaxed mb-4 line-clamp-2">
                  {record.crm_note || record.description}
                </p>
              )}
              <div className="space-y-1.5 mb-auto">
                {record.email && (
                  <div className="flex items-center gap-2 text-[12px] text-gray-400">
                    <Mail size={12} className="text-gray-300" />
                    <span className="truncate">{record.email}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2 text-[12px] text-gray-400">
                    <Phone size={12} className="text-gray-300" />
                    <span>{phone}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-gray-50">
                {statusColor && record.crm_status && (
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg tracking-tight uppercase"
                    style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                  >
                    {record.crm_status.replace(/_/g, ' ')}
                  </span>
                )}
                {record.company && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-gray-50 text-gray-500 border border-gray-100/60 flex items-center gap-1.5">
                    <Building2 size={10} className="text-gray-400" />
                    <span className="max-w-[100px] truncate">{record.company}</span>
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
