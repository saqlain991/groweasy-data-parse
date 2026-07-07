"use client";
import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import DropZone from '../../components/import/DropZone';
import PreviewTable from '../../components/import/PreviewTable';
import SummaryCards from '../../components/import/SummaryCards';
import ResultTable from '../../components/import/ResultTable';
import { useImportStore } from '../../store/importStore';
import { usePrefs } from '../../context/PrefsContext';
import { useImportStream } from '../../hooks/useImportStream';
import { PAGE_VARIANTS } from '../../lib/helpers';
import type { ImportResponse } from '../../lib/types';
import type { StreamProgress } from '../../hooks/useImportStream';

const STEP_LABELS = ['Upload', 'Preview', 'Processing', 'Result'] as const;

export default function ImportPage() {
  const {
    step, result, error, streamProgress, rows,
    reset, setProcessing, setResult, setError, setStreamProgress,
  } = useImportStore();
  const { addNotification } = usePrefs();
  const prevStepRef = useRef(step);

  const handleProgress = useCallback((p: StreamProgress) => setStreamProgress(p), [setStreamProgress]);
  const handleDone     = useCallback((r: ImportResponse) => {
    setResult(r);
    addNotification(`Import complete — ${r.totals.imported} leads imported, ${r.totals.skipped} skipped`);
  }, [setResult, addNotification]);
  const handleError    = useCallback((msg: string) => setError(msg), [setError]);

  const { start: startStream, abort } = useImportStream({ onProgress: handleProgress, onDone: handleDone, onError: handleError });

  useEffect(() => { prevStepRef.current = step; }, [step]);
  useEffect(() => () => abort(), [abort]);

  const handleConfirm = async () => {
    setProcessing();
    await startStream(rows);
  };

  const stepIndex = step === 'idle' ? 0 : step === 'previewing' ? 1 : step === 'processing' ? 2 : 3;
  const pct = streamProgress
    ? Math.min(100, Math.round((streamProgress.completedBatches / Math.max(streamProgress.totalBatches, 1)) * 100))
    : 0;

  return (
    <motion.div variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
      <Layout title="Import CSV" subtitle="AI-powered CRM lead mapping">
        <div className="px-5 lg:px-8 py-6 max-w-[1200px] mx-auto">

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEP_LABELS.map((label, i) => {
              const isActive = i === stepIndex;
              const isDone   = i < stepIndex;
              return (
                <React.Fragment key={label}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                    isActive ? 'bg-blue-600 text-white' :
                    isDone   ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                               'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500'
                  }`}>
                    <span>{i + 1}</span>
                    <span className="hidden sm:block">{label}</span>
                  </div>
                  {i < 3 && <div className={`flex-1 h-px max-w-[60px] ${isDone ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-white/10'}`} />}
                </React.Fragment>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {step === 'idle' && (
              <motion.div key="upload" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileUp size={32} className="text-blue-500" />
                  </div>
                  <h2 className="text-[22px] font-black text-gray-900 dark:text-gray-100 mb-2">Upload your CSV</h2>
                  <p className="text-[14px] text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Upload any lead CSV — any column names. Our AI maps it to the GrowEasy CRM schema automatically.
                  </p>
                </div>
                <DropZone />
              </motion.div>
            )}

            {step === 'previewing' && (
              <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <PreviewTable onConfirm={handleConfirm} />
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 gap-6 max-w-lg mx-auto w-full">
                <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Loader2 size={36} className="text-blue-500 animate-spin" />
                </div>

                <div className="text-center w-full">
                  <h3 className="text-[18px] font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {streamProgress?.isRetrying ? 'Retrying failed batch…' : 'AI is mapping your leads'}
                  </h3>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-6">
                    {streamProgress?.message || 'Sending rows to AI for field extraction…'}
                  </p>

                  {/* Animated progress bar */}
                  <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${streamProgress?.isRetrying ? 'bg-amber-400' : 'bg-blue-500'}`}
                      initial={{ width: '0%' }}
                      animate={{ width: `${Math.max(5, pct)}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>

                  {streamProgress && (
                    <div className="flex justify-between mt-2 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                      <span>Batch {streamProgress.completedBatches}/{streamProgress.totalBatches}</span>
                      <span>{pct}%</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 'done' && result && (
              <motion.div key="done" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
                <SummaryCards totals={result.totals} />
                <ResultTable result={result} />
              </motion.div>
            )}

            {step === 'error' && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center">
                  <AlertTriangle size={30} className="text-red-400" />
                </div>
                <h3 className="text-[18px] font-bold text-gray-900 dark:text-gray-100">Import failed</h3>
                <p className="text-[14px] text-red-500 dark:text-red-400 max-w-md">{error}</p>
                <div className="flex gap-3 mt-2">
                  <motion.button whileTap={{ scale: 0.96 }}
                    onClick={() => { setProcessing(); startStream(rows); }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2">
                    <RefreshCw size={14} /> Retry
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={reset}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-[13px] font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer bg-white dark:bg-[#13151c]">
                    Start over
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Layout>
    </motion.div>
  );
}
