"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function ShimmerBlock({ className }: { className?: string }) {
  return (
    <motion.div className={clsx('rounded-lg overflow-hidden relative bg-gray-100 dark:bg-white/5', className)}>
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)', backgroundSize: '700px 100%' }}
        animate={{ backgroundPosition: ['-700px 0', '700px 0'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
}
