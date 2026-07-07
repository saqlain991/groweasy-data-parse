"use client";
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface Props { children: React.ReactNode; title?: string; subtitle?: string; }

export default function Layout({ children, title = 'Dashboard', subtitle }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-canvas text-gray-900 dark:text-gray-100">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 lg:ml-[260px] min-w-0 transition-all duration-300">
        <Header title={title} subtitle={subtitle} onMenuOpen={() => setSidebarOpen(true)} />
        <main className="flex-1 p-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
