"use client";
import React from 'react';
import { motion } from 'framer-motion';
import LeadCard from './LeadCard';
import { STAGGER_CONTAINER } from '../../lib/helpers';
import type { CrmRecord } from '../../lib/types';

/** Shared responsive grid layout — used on Dashboard, Leads Directory, and Saved Leads */
export const LEAD_GRID_CLASS =
  'grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

interface Props {
  records: CrmRecord[];
  indexOffset?: number;
  animationKey?: string;
  onViewDetails?: (record: CrmRecord) => void;
}

export default function LeadGrid({
  records,
  indexOffset = 0,
  animationKey = 'lead-grid',
  onViewDetails,
}: Props) {
  return (
    <motion.div
      key={animationKey}
      variants={STAGGER_CONTAINER}
      initial="initial"
      animate="animate"
      className={LEAD_GRID_CLASS}
    >
      {records.map((record, i) => (
        <LeadCard
          key={`${record.email ?? ''}-${record.name ?? ''}-${indexOffset + i}`}
          record={record}
          index={indexOffset + i}
          onViewDetails={onViewDetails}
        />
      ))}
    </motion.div>
  );
}
