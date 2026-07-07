"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MapPin, Globe, Building2, Share2, Link2, CheckCircle2, ListTodo, FileText, Pencil, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import Layout from '../../../components/layout/Layout';
import AvatarInitials from '../../../components/ui/AvatarInitials';
import ErrorState from '../../../components/ui/ErrorState';
import useUser from '../../../hooks/useUser';
import { getBannerGradient, stripPhoneExt, PAGE_VARIANTS, STAGGER_CONTAINER, STAGGER_ITEM } from '../../../lib/helpers';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading, error } = useUser(id);

  if (loading) {
    return (
      <Layout title="User Profile">
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-pulse">
          <div className="h-48 bg-white rounded-3xl border border-gray-100" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="h-96 bg-white rounded-3xl border border-gray-100" />
            <div className="md:col-span-2 space-y-8">
              <div className="h-64 bg-white rounded-3xl border border-gray-100" />
              <div className="h-64 bg-white rounded-3xl border border-gray-100" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout title="Error">
        <div className="p-8">
          <ErrorState message={error ?? 'User not found'} onRetry={() => window.location.reload()} />
        </div>
      </Layout>
    );
  }

  return (
    <motion.div variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
      <Layout title={user.name} subtitle={`Expert profile • @${user.username}`}>
        <div className="px-5 lg:px-8 py-6 max-w-6xl mx-auto">
          <motion.button whileTap={{ scale: 0.96 }} whileHover={{ x: -2 }} onClick={() => router.push('/')}
            className="flex items-center gap-2 text-[13px] font-bold text-gray-400 hover:text-gray-900 transition-colors mb-6 group cursor-pointer">
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Directory
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-card relative" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="h-28 relative" style={{ background: getBannerGradient(user.name) }}>
                  <div className="absolute inset-0 bg-black/10" />
                  <motion.button whileTap={{ scale: 0.9 }}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-colors cursor-pointer">
                    <Pencil size={14} />
                  </motion.button>
                </div>
                <div className="px-6 pb-8">
                  <div className="relative -mt-10 mb-5 w-fit">
                    <AvatarInitials name={user.name} size="xl" className="ring-[6px] ring-white rounded-3xl shadow-lg" />
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center ring-4 ring-white">
                      <CheckCircle2 size={14} strokeWidth={3} className="text-white" />
                    </div>
                  </div>
                  <h2 className="text-[22px] font-black text-gray-900 tracking-tight leading-none mb-2">{user.name}</h2>
                  <div className="space-y-1 mb-6">
                    <p className="text-[14px] font-bold text-blue-600">Senior {user.company?.bs?.split(' ')[1]} Designer</p>
                    <p className="text-[13px] font-medium text-gray-400 flex items-center gap-1.5">
                      <MapPin size={12} className="text-gray-300" />{user.address?.city}, {user.address?.zipcode}
                    </p>
                  </div>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-6 italic opacity-90">&ldquo;{user.company?.catchPhrase}&rdquo;</p>
                  <div className="pt-6 border-t border-gray-50 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><Mail size={14} /></div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
                        <p className="text-[13px] font-bold text-gray-700 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><Phone size={14} /></div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</p>
                        <p className="text-[13px] font-bold text-gray-700">{stripPhoneExt(user.phone)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-50">
                    <span className="text-[11px] font-bold text-gray-400">JOINED JAN 2025</span>
                    <div className="flex items-center gap-3">
                      <Globe size={16} className="text-gray-300 cursor-pointer hover:text-blue-500 transition-colors" />
                      <Share2 size={16} className="text-gray-300 cursor-pointer hover:text-blue-400 transition-colors" />
                      <Link2 size={16} className="text-gray-300 cursor-pointer hover:text-gray-600 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-card" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><Building2 size={24} /></div>
                  <div>
                    <h3 className="text-[18px] font-black text-gray-900 tracking-tight leading-none">{user.company?.name}</h3>
                    <p className="text-[13px] font-bold text-blue-500 mt-1">{user.website}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Core Business</p>
                    <p className="text-[14px] font-semibold text-gray-700 capitalize italic">&ldquo;{user.company?.bs}&rdquo;</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Website</p>
                    <button className="flex items-center gap-1.5 text-[14px] font-bold text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
                      www.{user.website}<ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[15px] font-black text-gray-900 flex items-center gap-2"><FileText size={16} className="text-gray-400" />Recent Posts</h3>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">{user.posts?.length} total</span>
                  </div>
                  <div className="space-y-3">
                    {user.posts?.slice(0, 3).map((post) => (
                      <div key={post.id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-blue-100 hover:shadow-sm transition-all group">
                        <h4 className="text-[13.5px] font-bold text-gray-900 capitalize mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{post.title}</h4>
                        <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">{post.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[15px] font-black text-gray-900 flex items-center gap-2"><ListTodo size={16} className="text-gray-400" />Active Tasks</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-emerald-500">
                        {user.todos?.length > 0 ? Math.round((user.todos.filter(t => t.completed).length / user.todos.length) * 100) : 0}%
                      </span>
                      <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full"
                          style={{ width: user.todos?.length > 0 ? `${(user.todos.filter(t => t.completed).length / user.todos.length) * 100}%` : "0%" }} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {user.todos?.slice(0, 4).map((todo) => (
                      <div key={todo.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-50">
                        <div className={clsx('w-4 h-4 rounded-full flex items-center justify-center border shrink-0',
                          todo.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200')}>
                          {todo.completed && <CheckCircle2 size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={clsx('text-[12.5px] font-medium leading-none truncate flex-1',
                          todo.completed ? 'text-gray-400 line-through' : 'text-gray-700')}>{todo.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </motion.div>
  );
}
