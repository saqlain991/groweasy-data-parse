"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { MODAL_VARIANTS, BACKDROP_VARIANTS } from '../../lib/helpers';

interface Props {
  defaultName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}

export default function SaveDialog({ defaultName, onSave, onClose }: Props) {
  const [name, setName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        variants={BACKDROP_VARIANTS} initial="initial" animate="animate" exit="exit"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        variants={MODAL_VARIANTS} initial="initial" animate="animate" exit="exit"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-[17px] font-extrabold text-gray-900">Save Import</h3>
            <p className="text-[13px] text-gray-400 mt-0.5">Give this import a name to find it later</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Q2 Leads, Mumbai Campaign…"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] font-medium text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Save size={14} />
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
