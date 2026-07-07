"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Globe, TrendingUp } from 'lucide-react';
import { STAGGER_CONTAINER, STAT_CARD_VARIANTS } from '../../lib/helpers';

interface Stats { total: number; companies: number; cities: number; active: number; }

export default function StatsBar({ stats }: { stats: Stats }) {
  const STAT_CONFIG = [
    { icon: Users,      label: 'experts',     key: 'total'     as const, change: '+100%',    iconColor: 'text-blue-500',    iconBg: 'bg-blue-50' },
    { icon: Building2,  label: 'companies',   key: 'companies' as const, change: '10 unique', iconColor: 'text-violet-500',  iconBg: 'bg-violet-50' },
    { icon: Globe,      label: 'cities',      key: 'cities'    as const, change: 'Worldwide', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
    { icon: TrendingUp, label: 'engagement',  key: 'active'    as const, change: '100% live', iconColor: 'text-amber-600',   iconBg: 'bg-amber-50' },
  ];
  return (
    <motion.div variants={STAGGER_CONTAINER} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {STAT_CONFIG.map((stat) => (
        <motion.div key={stat.key} variants={STAT_CARD_VARIANTS}
          className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col shadow-card transition-all group hover:border-blue-200"
          style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 ${stat.iconBg} ${stat.iconColor} rounded-xl flex items-center justify-center`}>
              <stat.icon size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 uppercase tracking-tight">{stat.change}</span>
          </div>
          <div className="flex items-baseline gap-1 mt-auto">
            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[24px] font-black text-gray-900 leading-none">
              {stats[stat.key]}
            </motion.span>
          </div>
          <p className="text-[12px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
