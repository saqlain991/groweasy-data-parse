"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';
import { CENTER_SCALE_VARIANTS } from '../../lib/helpers';

interface Props { query?: string; onClear: () => void; }

export default function EmptyState({ query, onClear }: Props) {
  return (
    <motion.div variants={CENTER_SCALE_VARIANTS} initial="initial" animate="animate"
      className="flex flex-col items-center justify-center py-24 text-center">
      <motion.div initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}>
        <SearchX size={64} className="text-gray-200" />
      </motion.div>
      <h3 className="text-[18px] font-bold text-gray-900 mt-5">No experts found</h3>
      <p className="text-[14px] text-gray-400 mt-1.5">
        Try adjusting your search{query && <> for &ldquo;<strong>{query}</strong>&rdquo;</>}
      </p>
      <motion.button whileTap={{ scale: 0.95 }} onClick={onClear}
        className="mt-6 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-[13px] font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer">
        Clear search
      </motion.button>
    </motion.div>
  );
}
