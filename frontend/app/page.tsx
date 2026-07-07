"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Layout from '../components/layout/Layout';
import StatsBar from '../components/users/StatsBar';
import SearchBar from '../components/users/SearchBar';
import UserCard from '../components/users/UserCard';
import UserTable from '../components/users/UserTable';
import SkeletonCard from '../components/ui/SkeletonCard';
import SkeletonTable from '../components/ui/SkeletonTable';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import AvatarInitials from '../components/ui/AvatarInitials';
import useUsers from '../hooks/useUsers';
import useDebounce from '../hooks/useDebounce';
import useLocalStorage from '../hooks/useLocalStorage';
import { usePrefs } from '../context/PrefsContext';
import { STORAGE_KEYS, PAGE_VARIANTS, STAGGER_CONTAINER } from '../lib/helpers';
import type { User } from '../services/api';

export default function Dashboard() {
  const [viewMode, setViewMode] = useLocalStorage(STORAGE_KEYS.VIEW_MODE, 'grid');
  const [sortField, setSortField] = useLocalStorage(STORAGE_KEYS.SORT_FIELD, 'name');
  const [sortDir, setSortDir] = useLocalStorage(STORAGE_KEYS.SORT_DIR, 'asc');
  const [query, setQuery] = useLocalStorage(STORAGE_KEYS.LAST_QUERY, '');
  const [lastUserId, setLastUserId] = useLocalStorage<number | null>(STORAGE_KEYS.LAST_USER, null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const debouncedQuery = useDebounce(query, 300);
  const { users, loading, error, refetch } = useUsers();
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

  const stats = useMemo(() => ({
    total: users.length,
    companies: new Set(users.map(u => u.company?.name)).size,
    cities: new Set(users.map(u => u.address?.city)).size,
    active: users.length,
  }), [users]);

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
                  <span className="text-[13px] font-bold text-gray-700 group-hover:text-blue-600">{recent.name}</span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400 ml-1" />
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1,2,3,4].map(i => <div key={i} className="h-[120px] bg-white rounded-2xl border animate-pulse" />)}
            </div>
          ) : (
            <StatsBar stats={stats} />
          )}

          <SearchBar query={query} onQueryChange={setQuery} sortField={sortField} sortDir={sortDir}
            onSort={handleSort} viewMode={viewMode} onViewMode={setViewMode}
            resultCount={filteredUsers.length} totalCount={users.length} />

          <AnimatePresence mode="wait">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : filteredUsers.length === 0 ? (
              <EmptyState query={debouncedQuery} onClear={() => setQuery('')} />
            ) : viewMode === 'grid' ? (
              <motion.div variants={STAGGER_CONTAINER} initial="initial" animate="animate"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
                {filteredUsers.map((user, i) => (
                  <UserCard key={user.id} user={user} index={i} isExpanded={selectedUser?.id === user.id} onUserClick={handleUserClick} />
                ))}
              </motion.div>
            ) : (
              <UserTable users={filteredUsers} sortField={sortField} sortDir={sortDir} onSort={handleSort} onUserClick={handleUserClick} />
            )}
          </AnimatePresence>
        </div>
      </Layout>
    </motion.div>
  );
}
