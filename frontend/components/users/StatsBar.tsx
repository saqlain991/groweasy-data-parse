"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, Globe, Database } from 'lucide-react';
import { STAGGER_CONTAINER, STAT_CARD_VARIANTS } from '../../lib/helpers';

interface Stats { total: number; companies: number; cities: number; sources: number; }

export default function StatsBar({ stats }: { stats: Stats }) {
  const STAT_CONFIG = [
    { icon: Users,     label: 'Total Leads',  key: 'total'     as const, change: 'All imports', iconColor: 'text-blue-500',    iconBg: 'bg-blue-50 dark:bg-blue-500/10' },
    { icon: Building2, label: 'Companies',    key: 'companies' as const, change: 'Unique',      iconColor: 'text-violet-500',  iconBg: 'bg-violet-50 dark:bg-violet-500/10' },
    { icon: Globe,     label: 'Cities',       key: 'cities'    as const, change: 'Across',      iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { icon: Database,  label: 'Sources',      key: 'sources'   as const, change: 'Data sources', iconColor: 'text-amber-600',  iconBg: 'bg-amber-50 dark:bg-amber-500/10' },
  ];
  return (
    <motion.div variants={STAGGER_CONTAINER} initial="initial" animate="animate" className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {STAT_CONFIG.map((stat) => (
        <motion.div
          key={stat.key}
          variants={STAT_CARD_VARIANTS}
          className="group flex flex-col rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#13151c] p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md dark:hover:border-blue-500/30"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className={`flex size-10 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}>
              <stat.icon size={20} />
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">{stat.change}</span>
          </div>
          <div className="mt-auto flex items-baseline gap-1">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[24px] font-black leading-none text-gray-900 dark:text-gray-100"
            >
              {stats[stat.key]}
            </motion.span>
          </div>
          <p className="mt-2 text-[12px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
