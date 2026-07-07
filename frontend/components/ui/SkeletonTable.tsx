"use client";
import React from 'react';
import { motion } from 'framer-motion';
import ShimmerBlock from './ShimmerBlock';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/helpers';

export default function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3">
        <div className="flex gap-4">
          <ShimmerBlock className="h-4 w-24" />
          <ShimmerBlock className="h-4 w-32" />
          <ShimmerBlock className="h-4 w-28" />
          <ShimmerBlock className="h-4 w-20 ml-auto" />
        </div>
      </div>
      <motion.div variants={STAGGER_CONTAINER} initial="initial" animate="animate" className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, i) => (
          <motion.div key={i} variants={STAGGER_ITEM} className="px-4 py-4 flex items-center gap-4">
            <ShimmerBlock className="w-9 h-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <ShimmerBlock className="h-4 w-32" />
              <ShimmerBlock className="h-3 w-20" />
            </div>
            <ShimmerBlock className="h-4 w-40 hidden md:block" />
            <ShimmerBlock className="h-4 w-28 hidden lg:block" />
            <ShimmerBlock className="h-4 w-6 ml-auto" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
