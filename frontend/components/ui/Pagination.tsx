"use client";
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}

function buildRange(page: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (page > 3) pages.push('...');
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
  if (page < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function Pagination({ page, totalPages, total, pageSize, onPage }: Props) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const range = buildRange(page, totalPages);

  return (
    <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-white/10 pt-4">
      <span className="text-[12px] font-medium text-gray-400 dark:text-gray-500">
        Showing {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          type="button"
          className="rounded-lg border border-gray-200 dark:border-white/10 p-2 text-gray-400 dark:text-gray-500 transition-colors hover:border-blue-300 hover:text-gray-700 dark:hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={13} strokeWidth={2.5} />
        </button>
        {range.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="select-none px-1.5 text-[12px] text-gray-400 dark:text-gray-500">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              type="button"
              className={`size-8 rounded-lg border text-[12px] font-bold transition-colors ${
                p === page
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          type="button"
          className="rounded-lg border border-gray-200 dark:border-white/10 p-2 text-gray-400 dark:text-gray-500 transition-colors hover:border-blue-300 hover:text-gray-700 dark:hover:text-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={13} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
