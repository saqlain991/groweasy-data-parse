"use client";
import React from 'react';
import ShimmerBlock from './ShimmerBlock';

export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#13151c] rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      <ShimmerBlock className="h-[72px] rounded-none w-full" />
      <div className="px-4 pb-4 pt-1">
        <ShimmerBlock className="w-11 h-11 rounded-full -mt-5 mb-3 ring-2 ring-white dark:ring-[#13151c]" />
        <ShimmerBlock className="h-4 w-32 mb-1.5" />
        <ShimmerBlock className="h-3 w-24 mb-4" />
        <div className="space-y-1.5 mb-4">
          <ShimmerBlock className="h-3 w-full" />
          <ShimmerBlock className="h-3 w-3/4" />
        </div>
        <div className="space-y-1.5 mb-4">
          <ShimmerBlock className="h-3 w-44" />
          <ShimmerBlock className="h-3 w-36" />
        </div>
        <div className="flex gap-2">
          <ShimmerBlock className="h-6 w-20" />
          <ShimmerBlock className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}
