"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AppNotification {
  id: string;
  text: string;
  time: string;
  unread: boolean;
}

interface PrefsContextValue {
  saved: boolean;
  triggerSaved: () => void;
  notifications: AppNotification[];
  addNotification: (text: string) => void;
  markAllNotificationsRead: () => void;
  importToast: string | null;
}

const PrefsContext = createContext<PrefsContextValue | null>(null);

const SEED_NOTIFICATIONS: AppNotification[] = [
  { id: 'seed-1', text: 'Thanks For Using GrowEasy', time: '5m ago', unread: true }  
];

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [importToast, setImportToast] = useState<string | null>(null);

  const triggerSaved = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const addNotification = useCallback((text: string) => {
    const entry: AppNotification = {
      id: `${Date.now()}`,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: true,
    };
    setNotifications(prev => [entry, ...prev]);
    setImportToast(text);
    setTimeout(() => setImportToast(null), 4000);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  }, []);

  return (
    <PrefsContext.Provider value={{ saved, triggerSaved, notifications, addNotification, markAllNotificationsRead, importToast }}>
      {children}
    </PrefsContext.Provider>
  );
}

export const usePrefs = () => {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used within a PrefsProvider');
  return ctx;
};
