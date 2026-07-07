"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, BarChart3 } from 'lucide-react';
import { STAGGER_CONTAINER, STAT_CARD_VARIANTS } from '../../lib/helpers';
import type { ImportResponse } from '../../lib/types';

export default function SummaryCards({ totals }: { totals: ImportResponse['totals'] }) {
  const cards = [
    { label: 'Total Rows',  value: totals.received, icon: BarChart3,    color: 'text-blue-500',    bg: 'bg-blue-50' },
    { label: 'Imported',    value: totals.imported, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Skipped',     value: totals.skipped,  icon: XCircle,      color: 'text-amber-600',   bg: 'bg-amber-50' },
  ];
  return (
    <motion.div variants={STAGGER_CONTAINER} initial="initial" animate="animate" className="grid grid-cols-3 gap-4">
      {cards.map(c => (
        <motion.div key={c.label} variants={STAT_CARD_VARIANTS}
          className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className={`w-10 h-10 ${c.bg} ${c.color} rounded-xl flex items-center justify-center mb-3`}>
            <c.icon size={20} />
          </div>
          <p className="text-[28px] font-black text-gray-900 leading-none">{c.value}</p>
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{c.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
