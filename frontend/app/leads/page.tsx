"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, LayoutGrid, List, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import LeadGrid from '../../components/leads/LeadGrid';
import LeadTable from '../../components/leads/LeadTable';
import Pagination from '../../components/ui/Pagination';
import LeadDetailDrawer from '../../components/import/LeadDetailDrawer';
import useLocalStorage from '../../hooks/useLocalStorage';
import useDebounce from '../../hooks/useDebounce';
import { PAGE_VARIANTS, STORAGE_KEYS, GRID_PAGE_SIZE, LIST_PAGE_SIZE } from '../../lib/helpers';
import type { SavedImport, CrmRecord } from '../../lib/types';

export default function LeadsPage() {
  const [imports, setImports] = useLocalStorage<SavedImport[]>(STORAGE_KEYS.IMPORTS, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'list'>('leads_view_mode', 'grid');
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [drawerRecord, setDrawerRecord] = useState<CrmRecord | null>(null);
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebounce(query, 300);
  const pageSize = viewMode === 'grid' ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;

  const selectedImport = useMemo(
    () => imports.find(imp => imp.id === selectedId) ?? imports[0] ?? null,
    [imports, selectedId],
  );

  // Auto-select first batch
  useEffect(() => {
    if (!selectedId && imports.length > 0) setSelectedId(imports[0].id);
  }, [imports, selectedId]);

  // Reset state when batch or filters change
  useEffect(() => {
    setQuery('');
    setPage(1);
  }, [selectedId]);

  useEffect(() => { setPage(1); }, [debouncedQuery, sortField, sortDir, viewMode]);

  const filtered = useMemo(() => {
    if (!selectedImport) return [];
    let records = selectedImport.records;
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      records = records.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.company?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q),
      );
    }
    return [...records].sort((a, b) => {
      const av = (a[sortField as keyof CrmRecord] ?? '') as string;
      const bv = (b[sortField as keyof CrmRecord] ?? '') as string;
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [selectedImport, debouncedQuery, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setImports(prev => prev.filter(imp => imp.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
      <Layout title="Saved Leads" subtitle="Browse your imported CRM records">
        <div className="px-5 lg:px-8 py-6 max-w-[1400px] mx-auto">

          {imports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                <Archive size={28} className="text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-[18px] font-bold text-gray-900 dark:text-gray-100">No saved imports yet</h3>
              <p className="text-[14px] text-gray-400 dark:text-gray-500 max-w-sm">
                Import a CSV and click &ldquo;Save Import&rdquo; to start browsing your leads here.
              </p>
              <Link href="/import"
                className="mt-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-700 transition-colors">
                Import CSV
              </Link>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Batch selector */}
              <div className="flex flex-wrap gap-2.5">
                {imports.map(imp => {
                  const isActive = imp.id === (selectedId ?? imports[0]?.id);
                  return (
                    <button
                      key={imp.id}
                      onClick={() => setSelectedId(imp.id)}
                      className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-[13px] font-semibold transition-all cursor-pointer shadow-sm ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
                          : 'bg-slate-50 dark:bg-[#13151c] text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/5 hover:text-blue-700 dark:hover:text-blue-400'
                      }`}
                    >
                      <span className="max-w-[160px] truncate">{imp.name}</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                        isActive ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-transparent'
                      }`}>
                        {imp.records.length}
                      </span>
                      <span className={`text-[11px] shrink-0 hidden sm:inline ${isActive ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                        {formatDate(imp.savedAt)}
                      </span>
                      <span
                        onClick={e => handleDelete(imp.id, e)}
                        className={`ml-0.5 p-0.5 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ${
                          isActive ? 'hover:bg-blue-700 text-blue-100' : 'hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400'
                        }`}
                      >
                        <Trash2 size={11} />
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedImport && (
                <>
                  {/* Controls bar */}
                  <div className="flex items-center gap-3 flex-wrap rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#13151c] p-3 shadow-sm">
                    <div className="flex-1 min-w-[200px] relative">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                      <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search by name, email, company, city..."
                        className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white dark:bg-[#13151c] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      />
                    </div>
                    <span className="text-[12px] text-gray-500 dark:text-gray-500 font-medium whitespace-nowrap">
                      {filtered.length} of {selectedImport.records.length}
                    </span>
                    <div className="flex rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden bg-gray-50 dark:bg-white/5">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-2 cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-blue-600 dark:bg-white/10 text-white' : 'bg-white dark:bg-[#13151c] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                      >
                        <LayoutGrid size={15} />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-2 cursor-pointer transition-colors border-l border-gray-200 dark:border-white/10 ${viewMode === 'list' ? 'bg-blue-600 dark:bg-white/10 text-white' : 'bg-white dark:bg-[#13151c] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                      >
                        <List size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Records */}
                  <AnimatePresence mode="wait">
                    {filtered.length === 0 ? (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-center py-16 text-[14px] text-gray-400 dark:text-gray-500">
                        No records match your search.
                      </motion.div>
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
                </>
              )}
            </div>
          )}
        </div>
      </Layout>
      <LeadDetailDrawer record={drawerRecord} open={!!drawerRecord} onClose={() => setDrawerRecord(null)} />
    </motion.div>
  );
}



