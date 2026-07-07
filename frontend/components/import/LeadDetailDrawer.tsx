"use client";

import React from 'react';
import { Mail, Phone, Building2, MapPin, User, Tag, Clock, FileText, Calendar, Globe, Database } from 'lucide-react';
import AvatarInitials from '../ui/AvatarInitials';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '../ui/drawer';
import type { CrmRecord } from '../../lib/types';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  GOOD_LEAD_FOLLOW_UP: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', label: 'Good Lead · Follow Up' },
  DID_NOT_CONNECT:     { bg: 'bg-amber-50 dark:bg-amber-500/10',     text: 'text-amber-700 dark:text-amber-400',     label: 'Did Not Connect' },
  BAD_LEAD:            { bg: 'bg-red-50 dark:bg-red-500/10',         text: 'text-red-700 dark:text-red-400',         label: 'Bad Lead' },
  SALE_DONE:           { bg: 'bg-blue-50 dark:bg-blue-500/10',       text: 'text-blue-700 dark:text-blue-400',       label: 'Sale Done' },
};

const SOURCE_LABELS: Record<string, string> = {
  leads_on_demand: 'Leads on Demand',
  meridian_tower:  'Meridian Tower',
  eden_park:       'Eden Park',
  varah_swamy:     'Varah Swamy',
  sarjapur_plots:  'Sarjapur Plots',
};

interface FieldRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  mono?: boolean;
  multiline?: boolean;
}

function FieldRow({ icon, label, value, mono, multiline }: FieldRowProps) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-3.5 border-b border-gray-100 dark:border-white/5 last:border-0">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[10.5px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
        <p className={`break-words text-[13.5px] font-medium leading-relaxed text-gray-800 dark:text-gray-200 ${mono ? 'font-mono text-[12.5px]' : ''} ${multiline ? 'whitespace-pre-wrap' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

interface Props {
  record: CrmRecord | null;
  open: boolean;
  onClose: () => void;
}

export default function LeadDetailDrawer({ record, open, onClose }: Props) {
  const rec = record;
  const fullPhone = rec ? [rec.country_code, rec.mobile_without_country_code].filter(Boolean).join(' ') : '';
  const location = rec ? [rec.city, rec.state].filter(Boolean).join(', ') : '';
  const createdAt = rec?.created_at
    ? (() => {
        try { return new Date(rec.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
        catch { return rec.created_at; }
      })()
    : '';
  const statusStyle = rec?.crm_status ? STATUS_STYLES[rec.crm_status] : null;

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DrawerContent>
        {rec && (
          <>
            <DrawerHeader>
              <div className="flex items-start gap-4">
                <AvatarInitials name={rec.name} size="md" className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <DrawerTitle className="truncate">
                    {rec.name || 'Unnamed Lead'}
                  </DrawerTitle>
                  <DrawerDescription className="mt-0.5 truncate font-semibold">
                    {rec.company || rec.email || 'Full CRM lead details'}
                  </DrawerDescription>
                  {rec.company && rec.email && (
                    <p className="mt-0.5 truncate text-[12px] font-medium text-blue-500 dark:text-blue-400">{rec.email}</p>
                  )}
                </div>
              </div>
            </DrawerHeader>

            {/* Status + Source badges */}
            {(rec.crm_status || rec.data_source) && (
              <div className="flex shrink-0 flex-wrap gap-2 border-b border-gray-100 dark:border-white/10 px-6 py-3">
                {rec.crm_status && statusStyle && (
                  <span className={`rounded-full px-3 py-1 text-[11.5px] font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                    {statusStyle.label}
                  </span>
                )}
                {rec.data_source && (
                  <span className="rounded-full bg-gray-100 dark:bg-white/10 px-3 py-1 text-[11.5px] font-bold text-gray-600 dark:text-gray-400">
                    {SOURCE_LABELS[rec.data_source] || rec.data_source}
                  </span>
                )}
              </div>
            )}

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-2">

              <p className="mb-1 mt-3 text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-600">Contact</p>
              <FieldRow icon={<Mail size={14} />}  label="Email" value={rec.email} mono />
              <FieldRow icon={<Phone size={14} />} label="Phone" value={fullPhone} mono />

              <p className="mb-1 mt-4 text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-600">Location</p>
              <FieldRow icon={<MapPin size={14} />}  label="City / State" value={location} />
              <FieldRow icon={<Globe size={14} />}   label="Country"      value={rec.country} />

              <p className="mb-1 mt-4 text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-600">Assignment</p>
              <FieldRow icon={<Building2 size={14} />} label="Company"        value={rec.company} />
              <FieldRow icon={<User size={14} />}      label="Lead Owner"     value={rec.lead_owner} />
              <FieldRow icon={<Clock size={14} />}     label="Possession Time" value={rec.possession_time} />
              <FieldRow icon={<Calendar size={14} />}  label="Created"        value={createdAt} />
              <FieldRow icon={<Database size={14} />}  label="Data Source"    value={rec.data_source ? (SOURCE_LABELS[rec.data_source] || rec.data_source) : undefined} />

              {(rec.crm_note || rec.description) && (
                <>
                  <p className="mb-1 mt-4 text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-600">Notes</p>
                  <FieldRow icon={<Tag size={14} />}      label="CRM Note"    value={rec.crm_note?.replace(/\\n/g, '\n')} multiline />
                  <FieldRow icon={<FileText size={14} />} label="Description" value={rec.description?.replace(/\\n/g, '\n')} multiline />
                </>
              )}

              <div className="h-6" />
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
