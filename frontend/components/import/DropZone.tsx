"use client";
import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { parseCsvClient } from '../../lib/csv';
import { useImportStore } from '../../store/importStore';

export default function DropZone() {
  const { setRows, setFile } = useImportStore();
  const [dragging, setDragging]         = useState(false);
  const [fileError, setFileError]       = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing]           = useState(false);

  const processFile = useCallback(async (file: File) => {
    setFileError(null);
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setFileError('Only .csv files are accepted'); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File too large (max 10 MB)'); return;
    }
    try {
      setParsing(true);
      setSelectedFile(file);
      setFile(file);
      const rows = await parseCsvClient(file);
      if (rows.length === 0) { setFileError('CSV file is empty'); setParsing(false); return; }
      setRows(rows);
    } catch (e: unknown) {
      setFileError(e instanceof Error ? e.message : 'Failed to parse CSV');
      setParsing(false);
    }
  }, [setRows, setFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <motion.label
        htmlFor="csv-upload"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        whileHover={{ scale: 1.005 }}
        className={clsx(
          'relative flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all',
          dragging
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10 scale-[1.01]'
            : fileError
            ? 'border-red-400 bg-red-50 dark:bg-red-500/5'
            : selectedFile && !parsing
            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/5'
            : 'border-gray-300 dark:border-white/10 bg-white dark:bg-[#13151c] hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/5',
        )}
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <input
          id="csv-upload"
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={handleFileInput}
        />

        <div className={clsx(
          'w-16 h-16 rounded-2xl flex items-center justify-center transition-colors',
          dragging     ? 'bg-blue-500/20'    :
          fileError    ? 'bg-red-500/10'     :
          selectedFile ? 'bg-emerald-500/10' :
                         'bg-gray-50 dark:bg-white/5',
        )}>
          {parsing ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Upload size={32} className="text-blue-400" />
            </motion.div>
          ) : selectedFile && !fileError ? (
            <CheckCircle2 size={32} className="text-emerald-500" />
          ) : fileError ? (
            <AlertCircle size={32} className="text-red-400" />
          ) : dragging ? (
            <FileText size={32} className="text-blue-400" />
          ) : (
            <Upload size={32} className="text-gray-400 dark:text-gray-500" />
          )}
        </div>

        <div className="text-center">
          <p className="text-[16px] font-bold text-gray-800 dark:text-gray-100">
            {parsing      ? 'Parsing CSV…'      :
             selectedFile ? selectedFile.name    :
             dragging     ? 'Drop to upload'     :
                            'Drop your CSV file here'}
          </p>
          <p className="text-[13px] text-gray-500 dark:text-gray-500 mt-1">
            {selectedFile && !parsing
              ? `${(selectedFile.size / 1024).toFixed(1)} KB · click to change`
              : 'or click to browse — accepts .csv up to 10 MB'}
          </p>
        </div>

        {dragging && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-2xl border-2 border-blue-400 bg-blue-500/10 flex items-center justify-center pointer-events-none"
          >
            <p className="text-[16px] font-bold text-blue-500">Drop to upload</p>
          </motion.div>
        )}
      </motion.label>

      {fileError && (
        <motion.div
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-[13px] text-red-500 font-medium px-1"
        >
          <AlertCircle size={14} className="shrink-0" /> {fileError}
        </motion.div>
      )}

      <p className="text-[12px] text-gray-500 dark:text-gray-500 text-center">
        Any column names are fine — the AI will map them automatically.
      </p>
    </div>
  );
}
