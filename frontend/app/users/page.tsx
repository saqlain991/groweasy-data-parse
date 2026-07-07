"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, ChevronUp, Database } from 'lucide-react';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import SearchBar from '../../components/users/SearchBar';
import UserCard from '../../components/users/UserCard';
import UserTable from '../../components/users/UserTable';
import UserDetailModal from '../../components/users/UserDetailModal';
import LeadCard from '../../components/leads/LeadCard';
import LeadTable from '../../components/leads/LeadTable';
import SkeletonCard from '../../components/ui/SkeletonCard';
import SkeletonTable from '../../components/ui/SkeletonTable';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import AvatarInitials from '../../components/ui/AvatarInitials';
import useUsers from '../../hooks/useUsers';
import useUser from '../../hooks/useUser';
import useDebounce from '../../hooks/useDebounce';
import useLocalStorage from '../../hooks/useLocalStorage';
import { usePrefs } from '../../context/PrefsContext';
import { STORAGE_KEYS, PAGE_VARIANTS, STAGGER_CONTAINER, CENTER_SCALE_VARIANTS } from '../../lib/helpers';
import type { User } from '../../services/api';
import type { SavedImport, CrmRecord } from '../../lib/types';

const LEAD_PREVIEW = 8;

export default function UsersPage() {
  const [viewMode, setViewMode] = useLocalStorage(STORAGE_KEYS.VIEW_MODE, 'grid');
  const [sortField, setSortField] = useLocalStorage(STORAGE_KEYS.SORT_FIELD, 'name');
  const [sortDir, setSortDir] = useLocalStorage(STORAGE_KEYS.SORT_DIR, 'asc');
  const [query, setQuery] = useLocalStorage(STORAGE_KEYS.LAST_QUERY, '');
  const [lastUserId, setLastUserId] = useLocalStorage<number | null>(STORAGE_KEYS.LAST_USER, null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [leadsExpanded, setLeadsExpanded] = useState(true);

  const [savedImports] = useLocalStorage<SavedImport[]>(STORAGE_KEYS.IMPORTS, []);

  const debouncedQuery = useDebounce(query, 300);
  const { users, loading, error, refetch } = useUsers();
  const { user: detailedUser, loading: loadingDetailed } = useUser(selectedUser?.id);
  const { triggerSaved } = usePrefs();

  useEffect(() => {
    if (!loading) triggerSaved();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, sortField, sortDir]);

  const filteredUsers = useMemo(() => {
    let r = [...users];
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      r = r.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.company?.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
      );
    }
    r.sort((a, b) => {
      const va = (sortField === 'company' ? a.company?.name : a.name) ?? '';
      const vb = (sortField === 'company' ? b.company?.name : b.name) ?? '';
      const c = va.localeCompare(vb, undefined, { sensitivity: 'base' });
      return sortDir === 'asc' ? c : -c;
    });
    return r;
  }, [users, debouncedQuery, sortField, sortDir]);

  // Flatten all imported records across all saved imports
  const allLeads = useMemo<CrmRecord[]>(() => {
    const flat = savedImports.flatMap(imp => imp.records);
    if (!debouncedQuery.trim()) return flat;
    const q = debouncedQuery.toLowerCase();
    return flat.filter(r =>
      r.name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.company?.toLowerCase().includes(q),
    );
  }, [savedImports, debouncedQuery]);

  const previewLeads = allLeads.slice(0, LEAD_PREVIEW);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((d: string) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleUserClick = (user: User) => {
    setLastUserId(user.id);
    setSelectedUser(prev => prev?.id === user.id ? null : user);
  };

  return (
    <motion.div variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
      <Layout title="Experts Directory" subtitle="Manage and explore your user base">
        <div className="px-5 lg:px-8 py-6 max-w-[1600px] mx-auto">
          <AnimatePresence>
            {lastUserId && !loading && users.length > 0 && (() => {
              const recent = users.find(u => u.id === lastUserId);
              if (!recent) return null;
              return (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3 mb-6 px-4 py-2 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-blue-200 hover:bg-blue-50/40 transition-all group shadow-sm w-fit"
                  onClick={() => handleUserClick(recent)}>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Recently viewed</span>
                  <div className="w-px h-3 bg-gray-200 mx-1" />
                  <AvatarInitials name={recent.name} size="xs" className="rounded-lg" />
                  <span className="text-[13px] font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{recent.name}</span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400 transition-colors ml-1" />
                </motion.div>
              );
            })()}
          </AnimatePresence>

          <SearchBar query={query} onQueryChange={setQuery} sortField={sortField} sortDir={sortDir}
            onSort={handleSort} viewMode={viewMode} onViewMode={setViewMode}
            resultCount={filteredUsers.length} totalCount={users.length} />

          {/* Mock / API users */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" exit={{ opacity: 0 }}>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : <SkeletonTable rows={10} />}
              </motion.div>
            ) : error ? (
              <motion.div key="error" variants={CENTER_SCALE_VARIANTS} initial="initial" animate="animate">
                <ErrorState message={error} onRetry={refetch} />
              </motion.div>
            ) : filteredUsers.length === 0 ? (
              <motion.div key="empty"><EmptyState query={debouncedQuery} onClear={() => setQuery('')} /></motion.div>
            ) : viewMode === 'grid' ? (
              <motion.div key={`grid-${debouncedQuery}-${sortField}-${sortDir}`}
                variants={STAGGER_CONTAINER} initial="initial" animate="animate"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
                {filteredUsers.map((user, i) => (
                  <UserCard key={user.id} user={user} index={i} isExpanded={selectedUser?.id === user.id} onUserClick={handleUserClick} />
                ))}
              </motion.div>
            ) : (
              <motion.div key={`list-${debouncedQuery}-${sortField}-${sortDir}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <UserTable users={filteredUsers} sortField={sortField} sortDir={sortDir} onSort={handleSort} onUserClick={handleUserClick} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Imported Leads section */}
          {allLeads.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setLeadsExpanded(v => !v)}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Database size={14} className="text-blue-500" />
                  </div>
                  <span className="text-[15px] font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Imported Leads
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-black">
                    {allLeads.length}
                  </span>
                  {leadsExpanded ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                </button>
                <Link href="/leads"
                  className="text-[12px] font-bold text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1">
                  View all in Leads <ChevronRight size={12} />
                </Link>
              </div>

              <AnimatePresence>
                {leadsExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    {viewMode === 'grid' ? (
                      <motion.div
                        variants={STAGGER_CONTAINER} initial="initial" animate="animate"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start"
                      >
                        {previewLeads.map((record, i) => (
                          <LeadCard key={i} record={record} index={i} isExpanded={false} />
                        ))}
                      </motion.div>
                    ) : (
                      <LeadTable records={previewLeads} sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    )}
                    {allLeads.length > LEAD_PREVIEW && (
                      <div className="mt-4 text-center">
                        <Link href="/leads"
                          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors bg-white">
                          +{allLeads.length - LEAD_PREVIEW} more — View all in Leads
                          <ChevronRight size={13} />
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Layout>

      <AnimatePresence>
        {selectedUser && detailedUser && !loadingDetailed && (
          <UserDetailModal user={detailedUser} onClose={() => setSelectedUser(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
