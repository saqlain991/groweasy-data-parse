"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, CheckCircle2, FileCheck } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import Link from 'next/link';
import { usePrefs } from '../../context/PrefsContext';
import AvatarInitials from '../ui/AvatarInitials';
import { TOAST_VARIANTS } from '../../lib/helpers';

interface Props { title?: string; subtitle?: string; onMenuOpen: () => void; }
interface Message { id: number; sender: string; text: string; time: string; unread: boolean; }

export default function Header({ title, subtitle, onMenuOpen }: Props) {
  const { saved, notifications, addNotification: _add, markAllNotificationsRead, importToast } = usePrefs();
  const [activePopup, setActivePopup] = useState<'notifications' | 'messages' | 'profile' | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'Chelsey Dietrich',    text: 'Thanks for the intro!',       time: '10m ago', unread: true },
    { id: 2, sender: 'Clementina DuBuque', text: 'When is our next session?',    time: '2h ago',  unread: false },
  ]);

  const markAllMessagesRead = () => setMessages(msgs => msgs.map(m => ({ ...m, unread: false })));

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setActivePopup(null);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const togglePopup = (p: 'notifications' | 'messages' | 'profile') =>
    setActivePopup(prev => prev === p ? null : p);

  const unreadNotifCount = notifications.filter(n => n.unread).length;

  return (
    <header ref={headerRef} className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-100 dark:border-white/5 bg-white/88 dark:bg-[#13151c]/88 px-5 shadow-sm backdrop-blur-xl transition-colors lg:px-8">
      <div className="flex items-center gap-4">
        <button onClick={onMenuOpen} className="-ml-2 rounded-xl p-2 text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100 lg:hidden">
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-[18px] font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-none">{title}</h1>
          {subtitle && <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1 font-medium">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 relative">
        <AnimatePresence mode="wait">
          {importToast ? (
            <motion.div key="import-toast" variants={TOAST_VARIANTS} initial="initial" animate="animate" exit="exit"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-[12px] font-semibold mr-2 max-w-[260px]">
              <FileCheck size={12} className="text-blue-500 shrink-0" />
              <span className="truncate">{importToast}</span>
            </motion.div>
          ) : saved ? (
            <motion.div key="prefs-toast" variants={TOAST_VARIANTS} initial="initial" animate="animate" exit="exit"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[12px] font-semibold mr-2">
              <CheckCircle2 size={12} className="text-emerald-500" /> Preferences saved
            </motion.div>
          ) : null}
        </AnimatePresence>

        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => togglePopup('notifications')}
            className={`p-2.5 rounded-xl cursor-pointer text-gray-600 dark:text-gray-300 transition-colors ${activePopup === 'notifications' ? 'bg-gray-100 dark:bg-white/5' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}>
            <Bell size={19} />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-0.5 bg-blue-500 rounded-full ring-2 ring-white dark:ring-[#13151c] flex items-center justify-center text-[9px] font-black text-white">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            )}
          </motion.button>
          <AnimatePresence>
            {activePopup === 'notifications' && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 bg-white dark:bg-[#13151c] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-[60] origin-top-right">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                  <h3 className="text-[14px] font-bold text-gray-900 dark:text-gray-100">
                    Notifications
                    {unreadNotifCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300 text-[10px] font-black">{unreadNotifCount}</span>
                    )}
                  </h3>
                  <span onClick={markAllNotificationsRead} className="text-[11px] text-blue-500 font-bold cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="max-h-80 overflow-y-auto no-scrollbar">
                  {notifications.map(notif => (
                    <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer border-b border-gray-100 dark:border-white/5 last:border-0 flex gap-3 transition-colors">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.unread ? 'bg-blue-500' : 'bg-transparent border border-gray-200 dark:border-white/10'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-[12.5px] leading-snug mb-1 ${notif.unread ? 'text-gray-900 dark:text-gray-100 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>{notif.text}</p>
                        <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile profile */}
        <div className="relative lg:hidden">
          <div className="flex items-center gap-2 mr-2 cursor-pointer" onClick={() => togglePopup('profile')}>
            <AvatarInitials name="Admin User" size="sm" className="ring-2 ring-white dark:ring-[#13151c]" />
          </div>
          <AnimatePresence>
            {activePopup === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-2 top-12 z-[60] w-48 origin-top-right overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#13151c] shadow-xl">
                <div className="border-b border-gray-200 dark:border-white/10 px-4 py-3">
                  <p className="truncate text-[13px] font-bold text-gray-900 dark:text-gray-100">Admin User</p>
                  <p className="mt-0.5 truncate text-[11px] text-gray-400 dark:text-gray-500">admin@groweasy.ai</p>
                </div>
                <div className="p-2">
                  <button onClick={() => setActivePopup(null)} className="w-full rounded-lg px-3 py-2 text-left text-[13px] font-bold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
