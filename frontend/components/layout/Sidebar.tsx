"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, LayoutDashboard, Users, Zap, Wallet, BookOpen, FileText, Star, Globe, ChevronDown, LogOut, House, Upload, Database } from 'lucide-react';
import { clsx } from 'clsx';
import { SIDEBAR_VARIANTS, OVERLAY_VARIANTS } from '../../lib/helpers';
import AvatarInitials from '../ui/AvatarInitials';

const NAV_SECTIONS = [
  {
    items: [
      { path: '/', label: 'Dashboard', icon: House },
      
    ]
  },
  {
    label: 'Data Management',
    items: [
      { path: '/import', label: 'Import CSV', icon: Upload },
      { path: '/leads', label: 'Leads', icon: Database },
      { path: '/users', label: 'Leads Directory', icon: Users },
    ]
  },
  
  
];

interface Props { mobileOpen: boolean; onClose: () => void; }

export default function Sidebar({ mobileOpen, onClose }: Props) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar border-r border-white/5 text-sidebar-text relative">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center text-white">
            <Layers size={18} />
          </div>
          <span className="text-[17px] font-bold text-white tracking-tight">GrowEasy</span>
        </div>
        {mobileOpen && (
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 cursor-pointer">
            <X size={20} />
          </button>
        )}
      </div>
      <div className="p-3 border-b border-white/5">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/8 cursor-pointer transition-colors group">
          <AvatarInitials name="Admin User" size="sm" className="shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">Admin User</p>
            <p className="text-[11px] text-gray-400 truncate">admin@groweasy.ai</p>
          </div>
          <ChevronDown size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className={clsx(idx > 0 && 'mt-6')}>
            {section.label && (
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#4b5563] px-3 mb-2">{section.label}</p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link key={item.path} href={item.path} onClick={onClose}
                    className={clsx('sidebar-nav-item group cursor-pointer', isActive && 'sidebar-nav-active')}>
                    <item.icon size={18} className={clsx((item as { iconColor?: string }).iconColor || 'text-inherit')} />
                    <span className="flex-1">{item.label}</span>
                    {(item as { badge?: string }).badge && (
                      <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] text-white/60 font-medium">
                        {(item as { badge?: string }).badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-white/5">
        <Link href="/" onClick={onClose}
          className={clsx('sidebar-nav-item cursor-pointer', pathname === '/logout' && 'sidebar-nav-active')}>
          <LogOut size={18} /><span>Logout</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block fixed top-0 left-0 h-screen w-[260px] z-40">{sidebarContent}</aside>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div variants={OVERLAY_VARIANTS} initial="initial" animate="animate" exit="exit"
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden" onClick={onClose} />
            <motion.aside variants={SIDEBAR_VARIANTS} initial="closed" animate="open" exit="closed"
              className="fixed top-0 left-0 h-full w-[260px] z-[60] lg:hidden overflow-hidden">
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
