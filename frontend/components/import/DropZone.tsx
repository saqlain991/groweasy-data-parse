"use client";
import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { parseCsvClient } from '../../lib/csv';
import { useImportStore } from '../../store/importStore';

export default function DropZone() {
  const { setRows, setFile } = useImportStore();
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const processFile = useCallback(async (file: File) => {
    setFileError(null);
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setFileError('Only .csv files are accepted'); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File too large (max 10MB)'); return;
    }
    try {
      setSelectedFile(file);
      setFile(file);
      const rows = await parseCsvClient(file);
      if (rows.length === 0) { setFileError('CSV file is empty'); return; }
      setRows(rows);
    } catch (e: unknown) {
      setFileError(e instanceof Error ? e.message : 'Failed to parse CSV');
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
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.label htmlFor="csv-upload"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        className={clsx(
          'relative flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all',
          dragging ? 'border-blue-400 bg-blue-50 scale-[1.01]' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30',
          fileError && 'border-red-300 bg-red-50/20'
        )}
        style={{ boxShadow: 'var(--shadow-card)' }}>
        <input id="csv-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileInput} />
        <div className={clsx('w-16 h-16 rounded-2xl flex items-center justify-center', dragging ? 'bg-blue-100' : 'bg-gray-100')}>
          {selectedFile ? <FileText size={32} className="text-blue-500" /> : <Upload size={32} className="text-gray-400" />}
        </div>
        <div className="text-center">
          <p className="text-[16px] font-bold text-gray-900">{selectedFile ? selectedFile.name : 'Drop your CSV file here'}</p>
          <p className="text-[13px] text-gray-400 mt-1">
            {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'or click to browse — accepts .csv up to 10MB'}
          </p>
        </div>
        {dragging && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-2xl border-2 border-blue-400 bg-blue-50/50 flex items-center justify-center">
            <p className="text-[16px] font-bold text-blue-600">Drop to upload</p>
          </motion.div>
        )}
      </motion.label>
      {fileError && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 text-[13px] text-red-600 font-medium">
          <AlertCircle size={14} /> {fileError}
        </motion.div>
      )}
    </div>
  );
}
