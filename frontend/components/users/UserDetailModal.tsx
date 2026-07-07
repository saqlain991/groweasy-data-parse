"use client";
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MapPin, Globe, Building2, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import AvatarInitials from '../ui/AvatarInitials';
import { getBannerGradient, BACKDROP_VARIANTS, MODAL_VARIANTS } from '../../lib/helpers';
import type { UserWithDetails } from '../../services/api';

interface Props { user: UserWithDetails | null; onClose: () => void; }

function DetailField({ label, value, icon: Icon, subValue, prefix }: { label: string; value?: string; icon: React.ElementType; subValue?: string; prefix?: string; }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">{label}</label>
      <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-start gap-4">
        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 mt-0.5 shrink-0"><Icon size={16} /></div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-gray-100 truncate">
            {prefix && <span className="text-gray-500 font-medium">{prefix}</span>}{value}
          </p>
          {subValue && <p className="text-[12px] text-gray-400 mt-1 font-medium leading-relaxed italic opacity-80">{subValue}</p>}
        </div>
      </div>
    </div>
  );
}

export default function UserDetailModal({ user, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('profile');
  const TABS = ['profile', 'posts', 'todos'];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!user) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div variants={BACKDROP_VARIANTS} initial="initial" animate="animate" exit="exit"
        className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <motion.div variants={MODAL_VARIANTS} initial="initial" animate="animate" exit="exit"
        className="relative bg-modal border border-white/10 w-full max-w-[520px] max-h-[90vh] rounded-[24px] overflow-hidden flex flex-col shadow-modal no-scrollbar"
        onClick={(e) => e.stopPropagation()}>
        <div className="h-32 shrink-0 relative" style={{ background: getBannerGradient(user.name) }}>
          <div className="absolute inset-0 bg-black/15" />
          <motion.button whileTap={{ scale: 0.85 }} onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white backdrop-blur-md border border-white/10 transition-colors z-20">
            <X size={18} />
          </motion.button>
        </div>
        <div className="px-6 -mt-8 mb-6 relative z-10">
          <div className="flex items-end justify-between">
            <div className="relative">
              <AvatarInitials name={user.name} size="lg" className="ring-[4px] ring-modal rounded-2xl" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-modal">
                <CheckCircle2 size={13} strokeWidth={3} className="text-white" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-black text-white tracking-tight">{user.name}</h2>
              <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />Live
              </span>
            </div>
            <p className="text-[14px] text-gray-400 font-medium mt-0.5">{user.email}</p>
          </div>
        </div>
        <div className="px-6 grid grid-cols-4 gap-2 py-4 border-y border-white/5 mb-6">
          {[{ label: 'First seen', val: '1 Mar, 2025' }, { label: 'Purchase', val: '4 Mar, 2025' }, { label: 'Revenue', val: '$118.00' }, { label: 'MRR', val: '$0.00' }].map(s => (
            <div key={s.label}>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{s.label}</p>
              <p className="text-[13px] font-bold text-gray-200 mt-1">{s.val}</p>
            </div>
          ))}
        </div>
        <div className="px-6 flex-1 overflow-y-auto no-scrollbar pb-6">
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 mb-6">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={clsx('flex-1 py-2 text-[13px] font-bold rounded-lg transition-all capitalize',
                  activeTab === tab ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5')}>
                {tab === 'posts' ? `Posts (${user.posts?.length || 0})` : tab === 'todos' ? `Tasks (${user.todos?.length || 0})` : tab}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-5">
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 gap-4">
                  <DetailField label="Full Name" value={user.name} icon={Mail} />
                  <DetailField label="Email Address" value={user.email} icon={Mail} />
                  <DetailField label="Country" value={`${user.address?.city}, ${user.address?.zipcode}`} icon={MapPin} />
                  <DetailField label="Username" value={user.username} icon={Globe} prefix="userdir.ai/" />
                  <DetailField label="Company" value={user.company?.name} icon={Building2} subValue={user.company?.catchPhrase} />
                </div>
              )}
              {activeTab === 'posts' && (
                <div className="space-y-3">
                  {user.posts?.slice(0, 5).map((post) => (
                    <div key={post.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/8 transition-colors group">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="text-[14px] font-bold text-white capitalize line-clamp-1 flex-1 group-hover:text-blue-400 transition-colors">{post.title}</h4>
                        <span className="text-[10px] font-mono text-gray-500 font-bold"># {post.id}</span>
                      </div>
                      <p className="text-[12.5px] text-gray-400 leading-relaxed line-clamp-2">{post.body}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'todos' && (
                <div className="space-y-3">
                  <div className="mb-6 p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-bold text-gray-300 uppercase tracking-widest">Task Completion</span>
                      <span className="text-[12px] font-bold text-emerald-400">
                        {user.todos?.length > 0 ? Math.round((user.todos.filter(t => t.completed).length / user.todos.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }}
                        animate={{ width: user.todos?.length > 0 ? `${(user.todos.filter(t => t.completed).length / user.todos.length) * 100}%` : "0%" }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-emerald-500 rounded-full" />
                    </div>
                  </div>
                  {user.todos?.slice(0, 8).map((todo) => (
                    <div key={todo.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                      <div className={clsx('w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors',
                        todo.completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/20')}>
                        {todo.completed && <CheckCircle2 size={10} className="text-white" strokeWidth={4} />}
                      </div>
                      <span className={clsx('text-[13px] font-medium leading-none', todo.completed ? 'text-gray-500 line-through' : 'text-gray-200')}>{todo.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3 mt-auto shrink-0 bg-modal">
          <motion.button whileTap={{ scale: 0.96 }} onClick={onClose}
            className="px-6 py-2.5 bg-white text-[#0e0f14] text-[14px] font-black rounded-xl hover:bg-gray-100 transition-transform cursor-pointer">
            Close
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
