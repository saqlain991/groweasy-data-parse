"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, Upload } from 'lucide-react';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import StatsBar from '../../components/users/StatsBar';
import SearchBar from '../../components/users/SearchBar';
import LeadGrid from '../../components/leads/LeadGrid';
import LeadTable from '../../components/leads/LeadTable';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import LeadDetailDrawer from '../../components/import/LeadDetailDrawer';
import { useSavedLeads } from '../../hooks/useSavedLeads';
import useDebounce from '../../hooks/useDebounce';
import useLocalStorage from '../../hooks/useLocalStorage';
import { PAGE_VARIANTS, STORAGE_KEYS, GRID_PAGE_SIZE, LIST_PAGE_SIZE } from '../../lib/helpers';
import type { CrmRecord } from '../../lib/types';

export default function UsersPage() {
  const [viewMode, setViewMode]   = useLocalStorage(STORAGE_KEYS.VIEW_MODE, 'grid');
  const [sortField, setSortField] = useLocalStorage(STORAGE_KEYS.SORT_FIELD, 'name');
  const [sortDir, setSortDir]     = useLocalStorage(STORAGE_KEYS.SORT_DIR, 'asc');
  const [query, setQuery]         = useLocalStorage(STORAGE_KEYS.LAST_QUERY, '');
  const [drawerRecord, setDrawerRecord] = useState<CrmRecord | null>(null);
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebounce(query, 300);
  const { records, stats, imports } = useSavedLeads();
  const pageSize = viewMode === 'grid' ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;

  const filtered = useMemo(() => {
    let r = [...records];
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      r = r.filter(rec =>
        rec.name?.toLowerCase().includes(q) ||
        rec.email?.toLowerCase().includes(q) ||
        rec.company?.toLowerCase().includes(q) ||
        rec.city?.toLowerCase().includes(q),
      );
    }
    r.sort((a, b) => {
      const va = (sortField === 'company' ? a.company : a.name) ?? '';
      const vb = (sortField === 'company' ? b.company : b.name) ?? '';
      const c = va.localeCompare(vb, undefined, { sensitivity: 'base' });
      return sortDir === 'asc' ? c : -c;
    });
    return r;
  }, [records, debouncedQuery, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [debouncedQuery, sortField, sortDir, viewMode]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((d: string) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  if (imports.length === 0) {
    return (
      <motion.div variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
        <Layout title="Leads Directory" subtitle="Your CRM leads overview">
          <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5">
              <Archive size={36} className="text-gray-300 dark:text-gray-500" />
            </div>
            <div>
              <h2 className="mb-2 text-[22px] font-black text-gray-900 dark:text-gray-100">No leads yet</h2>
              <p className="max-w-sm text-[14px] text-gray-400 dark:text-gray-500">
                Import a CSV file and save it. Your leads will appear here automatically.
              </p>
            </div>
            <div className="mt-2 flex gap-3">
              <Link href="/import"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-blue-700">
                <Upload size={15} /> Import CSV
              </Link>
              <Link href="/leads"
                className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-[13px] font-bold text-gray-700 transition-colors hover:border-blue-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                Saved Leads
              </Link>
            </div>
          </div>
        </Layout>
      </motion.div>
    );
  }

  return (
    <motion.div variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
      <Layout title="Leads Directory" subtitle={`${records.length} leads across ${imports.length} import${imports.length > 1 ? 's' : ''}`}>
        <div className="mx-auto max-w-[1600px] px-5 py-6 lg:px-8">
          <StatsBar stats={stats} />

          <SearchBar
            query={query}
            onQueryChange={setQuery}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
            viewMode={viewMode}
            onViewMode={setViewMode}
            resultCount={filtered.length}
            totalCount={records.length}
          />

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <EmptyState query={debouncedQuery} onClear={() => setQuery('')} />
            ) : viewMode === 'grid' ? (
              <LeadGrid
                records={paged}
                indexOffset={(page - 1) * pageSize}
                animationKey={`grid-p${page}`}
                onViewDetails={setDrawerRecord}
              />
            ) : (
              <motion.div key={`list-p${page}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LeadTable
                  records={paged}
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                  onRowClick={setDrawerRecord}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={filtered.length}
            pageSize={pageSize}
            onPage={setPage}
          />
        </div>
      </Layout>
      <LeadDetailDrawer record={drawerRecord} open={!!drawerRecord} onClose={() => setDrawerRecord(null)} />
    </motion.div>
  );
}

