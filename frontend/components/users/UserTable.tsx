"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowUpDown, Mail, Building2, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import AvatarInitials from '../ui/AvatarInitials';
import { stripPhoneExt, STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/helpers';
import type { User } from '../../services/api';

interface Props {
  users: User[];
  sortField: string;
  sortDir: string;
  onSort: (field: string) => void;
  onUserClick: (user: User) => void;
}

export default function UserTable({ users, sortField, sortDir, onSort, onUserClick }: Props) {
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: false },
    { key: 'company', label: 'Company', sortable: true },
    { key: 'city', label: 'City', sortable: false },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {columns.map((col) => {
                const isActive = sortField === col.key;
                return (
                  <th key={col.key} onClick={() => col.sortable && onSort(col.key)}
                    className={clsx('text-[11.5px] font-bold text-gray-400 uppercase tracking-widest py-3 px-4 text-left select-none',
                      col.sortable && 'cursor-pointer group hover:text-gray-600 transition-colors')}>
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && (
                        isActive
                          ? <motion.span animate={{ rotate: sortDir === 'desc' ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-blue-500"><ArrowUp size={12} strokeWidth={3} /></motion.span>
                          : <ArrowUpDown size={12} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                      )}
                    </div>
                  </th>
                );
              })}
              <th className="w-12"></th>
            </tr>
          </thead>
          <motion.tbody variants={STAGGER_CONTAINER} initial="initial" animate="animate">
            {users.map((user) => (
              <motion.tr key={user.id} variants={STAGGER_ITEM} onClick={() => onUserClick(user)}
                className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 cursor-pointer transition-colors group">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <AvatarInitials name={user.name} size="sm" className="rounded-lg shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-bold text-gray-900 truncate leading-none">{user.name}</p>
                      <p className="text-[11.5px] text-gray-400 mt-1 font-mono truncate">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                    <span className="text-[13px] text-gray-600 truncate">{user.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{stripPhoneExt(user.phone)}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center text-blue-500 shrink-0"><Building2 size={12} /></div>
                    <span className="text-[13px] font-semibold text-gray-700 truncate max-w-[140px]">{user.company?.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{user.address?.city}</td>
                <td className="px-4 py-3.5 text-right">
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors ml-auto" />
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
