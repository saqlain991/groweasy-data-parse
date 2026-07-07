"use client";
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Loader2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import DropZone from '../../components/import/DropZone';
import PreviewTable from '../../components/import/PreviewTable';
import SummaryCards from '../../components/import/SummaryCards';
import ResultTable from '../../components/import/ResultTable';
import { useImportStore } from '../../store/importStore';
import { usePrefs } from '../../context/PrefsContext';
import { PAGE_VARIANTS } from '../../lib/helpers';

const STEP_LABELS = ['Upload', 'Preview', 'Processing', 'Result'] as const;

export default function ImportPage() {
  const { step, result, error, progress, reset } = useImportStore();
  const { addNotification } = usePrefs();
  const prevStepRef = useRef(step);

  useEffect(() => {
    if (prevStepRef.current !== 'done' && step === 'done' && result) {
      addNotification(`Import complete — ${result.totals.imported} leads imported, ${result.totals.skipped} skipped`);
    }
    prevStepRef.current = step;
  }, [step, result, addNotification]);

  const stepIndex = step === 'idle' ? 0 : step === 'previewing' ? 1 : step === 'processing' ? 2 : 3;

  return (
    <motion.div variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
      <Layout title="Import CSV" subtitle="AI-powered CRM lead mapping">
        <div className="px-5 lg:px-8 py-6 max-w-[1200px] mx-auto">

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEP_LABELS.map((label, i) => {
              const isActive = i === stepIndex;
              const isDone = i < stepIndex;
              return (
                <React.Fragment key={label}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${isActive ? 'bg-blue-600 text-white' : isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                    <span>{i + 1}</span>
                    <span className="hidden sm:block">{label}</span>
                  </div>
                  {i < 3 && <div className={`flex-1 h-px max-w-[60px] ${isDone ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {step === 'idle' && (
              <motion.div key="upload" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileUp size={32} className="text-blue-500" />
                  </div>
                  <h2 className="text-[22px] font-black text-gray-900 mb-2">Upload your CSV</h2>
                  <p className="text-[14px] text-gray-500 max-w-md mx-auto">
                    Upload any lead CSV — any column names. Our AI maps it to the GrowEasy CRM schema automatically.
                  </p>
                </div>
                <DropZone />
              </motion.div>
            )}

            {step === 'previewing' && (
              <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <PreviewTable />
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 gap-6">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                  <Loader2 size={36} className="text-blue-500 animate-spin" />
                </div>
                <div className="text-center">
                  <h3 className="text-[18px] font-bold text-gray-900 mb-1.5">Processing your CSV</h3>
                  <p className="text-[14px] text-gray-500">{progress || 'AI is mapping your leads to CRM fields...'}</p>
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
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-[18px] font-bold text-gray-900">Import failed</h3>
                <p className="text-[14px] text-red-500 max-w-md">{error}</p>
                <motion.button whileTap={{ scale: 0.96 }} onClick={reset}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-[13px] font-bold hover:bg-gray-800 transition-colors cursor-pointer">
                  Try again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Layout>
    </motion.div>
  );
}
