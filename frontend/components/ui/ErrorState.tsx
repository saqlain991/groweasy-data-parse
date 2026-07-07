"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { CENTER_SCALE_VARIANTS } from '../../lib/helpers';

interface Props { message?: string; onRetry: () => void; }

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <motion.div variants={CENTER_SCALE_VARIANTS} initial="initial" animate="animate"
      className="flex flex-col items-center justify-center py-24 text-center">
      <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
        <AlertTriangle size={52} className="text-red-400" />
      </motion.div>
      <h3 className="text-[18px] font-bold text-gray-900 mt-4">Failed to load users</h3>
      <code className="mt-2 text-[12px] text-red-500 bg-red-50 px-4 py-2 rounded-xl font-mono border border-red-100 max-w-md break-all">
        {message}
      </code>
      <motion.button whileTap={{ scale: 0.95 }} onClick={onRetry}
        className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-[13px] font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
        <RotateCcw size={14} /> Try again
      </motion.button>
    </motion.div>
  );
}
