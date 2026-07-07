"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, Upload, FolderOpen, Folder, FileSpreadsheet, CalendarDays, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import StatsBar from '../components/users/StatsBar';
import SearchBar from '../components/users/SearchBar';
import LeadGrid from '../components/leads/LeadGrid';
import LeadTable from '../components/leads/LeadTable';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import LeadDetailDrawer from '../components/import/LeadDetailDrawer';
import { useSavedLeads } from '../hooks/useSavedLeads';
import useDebounce from '../hooks/useDebounce';
import useLocalStorage from '../hooks/useLocalStorage';
import { PAGE_VARIANTS, STORAGE_KEYS, GRID_PAGE_SIZE, LIST_PAGE_SIZE } from '../lib/helpers';
import type { SavedImport, CrmRecord } from '../lib/types';

// ── Folder card ─────────────────────────────────────────────────────────────
function FolderCard({ imp, isActive, onClick }: { imp: SavedImport; isActive: boolean; onClick: () => void }) {
  const date = new Date(imp.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`group flex flex-col rounded-2xl border-2 transition-all cursor-pointer overflow-hidden text-left w-full bg-white dark:bg-[#13151c] shadow-sm ${
        isActive
          ? 'border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]'
          : 'border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/40'
      }`}
    >
      {/* Folder tab + icon area */}
      <div className={`px-4 pt-4 pb-3 flex items-center gap-3 ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-500/10'
          : 'bg-amber-50 dark:bg-amber-500/5 group-hover:bg-blue-50/60 dark:group-hover:bg-blue-500/5'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isActive ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                   : 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/15 group-hover:text-blue-600 dark:group-hover:text-blue-400'
        } transition-colors`}>
          {isActive ? <FolderOpen size={20} /> : <Folder size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[13.5px] font-extrabold leading-tight truncate ${
            isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300'
          } transition-colors`}>
            {imp.name}
          </p>
          <span className={`inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
            isActive ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-transparent'
                     : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-transparent'
          }`}>
            <FileSpreadsheet size={9} />
            {imp.records.length} records
          </span>
        </div>
      </div>
      {/* Footer */}
      <div className={`px-4 py-2.5 flex items-center justify-between border-t ${
        isActive
          ? 'border-blue-200 dark:border-blue-500/20 bg-white dark:bg-[#13151c]'
          : 'border-gray-100 dark:border-white/5 bg-white dark:bg-[#13151c]'
      }`}>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
          <CalendarDays size={10} />
          <span>{date}</span>
        </div>
        <ChevronRight size={12} className={`${isActive ? 'text-blue-400' : 'text-gray-300 dark:text-gray-600 group-hover:text-blue-400'} transition-colors`} />
      </div>
    </motion.button>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [viewMode, setViewMode]   = useLocalStorage(STORAGE_KEYS.VIEW_MODE, 'grid');
  const [sortField, setSortField] = useLocalStorage(STORAGE_KEYS.SORT_FIELD, 'name');
  const [sortDir, setSortDir]     = useLocalStorage(STORAGE_KEYS.SORT_DIR, 'asc');
  const [query, setQuery]         = useLocalStorage(STORAGE_KEYS.LAST_QUERY, '');
  const [drawerRecord, setDrawerRecord] = useState<CrmRecord | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebounce(query, 300);
  const { stats, imports } = useSavedLeads();
  const pageSize = viewMode === 'grid' ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;

  // Select first import by default
  const activeId = selectedId ?? imports[0]?.id ?? null;
  const activeImport = imports.find(imp => imp.id === activeId) ?? null;
  const activeRecords = activeImport?.records ?? [];

  const filtered = useMemo(() => {
    let r = [...activeRecords];
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
  }, [activeRecords, debouncedQuery, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [debouncedQuery, sortField, sortDir, viewMode, activeId]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((d: string) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleFolderClick = (id: string) => {
    setSelectedId(id);
    setQuery('');
    setPage(1);
  };

  // Empty state
  if (imports.length === 0) {
    return (
      <motion.div variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
        <Layout title="Dashboard" subtitle="Your CRM lead overview">
          <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5">
              <Archive size={36} className="text-gray-300 dark:text-gray-500" />
            </div>
            <div>
              <h2 className="mb-2 text-[22px] font-black text-gray-900 dark:text-gray-100">No leads yet</h2>
              <p className="max-w-sm text-[14px] text-gray-400 dark:text-gray-500">
                Import a CSV file and save it — your leads will appear here automatically.
              </p>
            </div>
            <div className="mt-2 flex gap-3">
              <Link href="/import"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-blue-700">
                <Upload size={15} /> Import CSV
              </Link>
            </div>
          </div>
        </Layout>
      </motion.div>
    );
  }

  return (
    <motion.div variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
      <Layout title="Dashboard" subtitle={`${imports.length} import${imports.length > 1 ? 's' : ''} · ${imports.reduce((s, i) => s + i.records.length, 0)} total leads`}>
        <div className="mx-auto max-w-[1600px] px-5 py-6 lg:px-8">

          <StatsBar stats={stats} />

          {/* ── Import folders ── */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[16px] font-extrabold text-gray-900 dark:text-gray-100">Import Folders</h2>
                <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium">Click a folder to browse its records below</p>
              </div>
              <Link href="/import"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 transition-colors">
                <Upload size={13} /> Import CSV
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {imports.map(imp => (
                <FolderCard
                  key={imp.id}
                  imp={imp}
                  isActive={imp.id === activeId}
                  onClick={() => handleFolderClick(imp.id)}
                />
              ))}
            </div>
          </div>

          {/* ── Records from selected folder ── */}
          <AnimatePresence mode="wait">
            {activeImport && (
              <motion.div
                key={activeId ?? 'none'}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                      <FolderOpen size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[14px] font-extrabold text-gray-900 dark:text-gray-100 leading-none">{activeImport.name}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">{activeImport.records.length} records</p>
                    </div>
                  </div>
                </div>

                <SearchBar
                  query={query}
                  onQueryChange={setQuery}
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                  viewMode={viewMode}
                  onViewMode={setViewMode}
                  resultCount={filtered.length}
                  totalCount={activeImport.records.length}
                />

                <AnimatePresence mode="wait">
                  {filtered.length === 0 ? (
                    <EmptyState query={debouncedQuery} onClear={() => setQuery('')} />
                  ) : viewMode === 'grid' ? (
                    <LeadGrid
                      records={paged}
                      indexOffset={(page - 1) * pageSize}
                      animationKey={`grid-${activeId}-p${page}`}
                      onViewDetails={setDrawerRecord}
                    />
                  ) : (
                    <motion.div key={`list-${activeId}-p${page}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Layout>
      <LeadDetailDrawer record={drawerRecord} open={!!drawerRecord} onClose={() => setDrawerRecord(null)} />
    </motion.div>
  );
}
