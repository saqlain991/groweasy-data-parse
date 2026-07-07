"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, MessageSquare, Bell, CheckCircle2, FileCheck } from 'lucide-react';
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
    <header ref={headerRef} className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-xl border-b border-[#f1f3f9] px-5 lg:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        <button onClick={onMenuOpen} className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors cursor-pointer">
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-[18px] font-bold text-gray-900 tracking-tight leading-none">{title}</h1>
          {subtitle && <p className="text-[12px] text-gray-400 mt-1 font-medium">{subtitle}</p>}
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

        {/* Messages */}
        {/* <div className="relative">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => togglePopup('messages')}
            className={`p-2.5 rounded-xl cursor-pointer text-gray-500 transition-colors ${activePopup === 'messages' ? 'bg-gray-100' : 'hover:bg-gray-100'}`}>
            <MessageSquare size={19} />
            {messages.some(m => m.unread) && <span className="absolute top-2.5 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />}
          </motion.button>
          <AnimatePresence>
            {activePopup === 'messages' && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-[60] origin-top-right">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-[14px] font-bold text-gray-900">Messages</h3>
                  <span onClick={markAllMessagesRead} className="text-[11px] text-blue-500 font-bold cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="max-h-80 overflow-y-auto no-scrollbar">
                  {messages.map(msg => (
                    <div key={msg.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex gap-3 transition-colors">
                      <AvatarInitials name={msg.sender} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <p className="text-[13px] font-bold text-gray-900 truncate">{msg.sender}</p>
                          <span className="text-[11px] font-medium text-gray-400">{msg.time}</span>
                        </div>
                        <p className={`text-[12px] truncate ${msg.unread ? 'text-gray-800 font-bold' : 'text-gray-500'}`}>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-100 text-center">
                  <Link href="/" onClick={() => setActivePopup(null)} className="text-[12px] font-bold text-blue-500 hover:text-blue-600">View all messages</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div> */}

        {/* Notifications */}
        <div className="relative">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => togglePopup('notifications')}
            className={`p-2.5 rounded-xl cursor-pointer text-gray-500 transition-colors ${activePopup === 'notifications' ? 'bg-gray-100' : 'hover:bg-gray-100'}`}>
            <Bell size={19} />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-0.5 bg-blue-500 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-black text-white">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            )}
          </motion.button>
          <AnimatePresence>
            {activePopup === 'notifications' && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-[60] origin-top-right">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-[14px] font-bold text-gray-900">
                    Notifications
                    {unreadNotifCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-black">{unreadNotifCount}</span>
                    )}
                  </h3>
                  <span onClick={markAllNotificationsRead} className="text-[11px] text-blue-500 font-bold cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="max-h-80 overflow-y-auto no-scrollbar">
                  {notifications.map(notif => (
                    <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex gap-3 transition-colors">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.unread ? 'bg-blue-500' : 'bg-transparent border border-gray-200'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-[12.5px] leading-snug mb-1 ${notif.unread ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>{notif.text}</p>
                        <p className="text-[11px] font-medium text-gray-400">{notif.time}</p>
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
            <AvatarInitials name="Admin User" size="sm" className="ring-2 ring-white" />
          </div>
          <AnimatePresence>
            {activePopup === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-2 top-12 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-[60] origin-top-right">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-[13px] font-bold text-gray-900 truncate">Admin User</p>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">admin@groweasy.ai</p>
                </div>
                <div className="p-2">
                  <button onClick={() => setActivePopup(null)} className="w-full text-left px-3 py-2 text-[13px] font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
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
