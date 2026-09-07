import { useState, useEffect, useCallback } from 'react';
import type { FinancialSnapshot, UserProfile, Deal, BarterItem, AuditCheck, Contact, Message } from '../types';

const STORAGE_KEY = 'fs_data_v1';

interface AppData {
  profile: UserProfile;
  snapshots: FinancialSnapshot[];
  deals: Deal[];
  barters: BarterItem[];
  audits: AuditCheck[];
  contacts: Contact[];
  messages: Message[];
}

const defaultProfile: UserProfile = {
  id: crypto.randomUUID(),
  name: 'User',
  avatar: '👤',
  currency: 'RUB',
  language: 'ru',
  theme: 'dark',
};

const defaultData: AppData = {
  profile: defaultProfile,
  snapshots: [],
  deals: [],
  barters: [],
  audits: [],
  contacts: [],
  messages: [],
};

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultData, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultData;
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useDataStore() {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const updateProfile = useCallback((profile: Partial<UserProfile>) => {
    setData(d => ({ ...d, profile: { ...d.profile, ...profile } }));
  }, []);

  const addSnapshot = useCallback((snapshot: FinancialSnapshot) => {
    setData(d => ({ ...d, snapshots: [...d.snapshots, snapshot] }));
  }, []);

  const updateSnapshot = useCallback((index: number, snapshot: FinancialSnapshot) => {
    setData(d => {
      const arr = [...d.snapshots];
      arr[index] = snapshot;
      return { ...d, snapshots: arr };
    });
  }, []);

  const deleteSnapshot = useCallback((index: number) => {
    setData(d => ({
      ...d,
      snapshots: d.snapshots.filter((_, i) => i !== index),
    }));
  }, []);

  const addDeal = useCallback((deal: Deal) => {
    setData(d => ({ ...d, deals: [...d.deals, deal] }));
  }, []);

  const updateDeal = useCallback((id: string, deal: Partial<Deal>) => {
    setData(d => ({
      ...d,
      deals: d.deals.map(x => x.id === id ? { ...x, ...deal } : x),
    }));
  }, []);

  const deleteDeal = useCallback((id: string) => {
    setData(d => ({ ...d, deals: d.deals.filter(x => x.id !== id) }));
  }, []);

  const addBarter = useCallback((item: BarterItem) => {
    setData(d => ({ ...d, barters: [...d.barters, item] }));
  }, []);

  const deleteBarter = useCallback((id: string) => {
    setData(d => ({ ...d, barters: d.barters.filter(x => x.id !== id) }));
  }, []);

  const updateAudit = useCallback((id: string, completed: boolean) => {
    setData(d => ({
      ...d,
      audits: d.audits.map(x => x.id === id ? { ...x, completed } : x),
    }));
  }, []);

  const setAudits = useCallback((audits: AuditCheck[]) => {
    setData(d => ({ ...d, audits }));
  }, []);

  const addContact = useCallback((contact: Contact) => {
    setData(d => ({ ...d, contacts: [...d.contacts, contact] }));
  }, []);

  const addMessage = useCallback((msg: Message) => {
    setData(d => ({ ...d, messages: [...d.messages, msg] }));
  }, []);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-system-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importJSON = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        setData({ ...defaultData, ...parsed });
      } catch (e) {
        alert('Invalid file');
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    data,
    updateProfile,
    addSnapshot,
    updateSnapshot,
    deleteSnapshot,
    addDeal,
    updateDeal,
    deleteDeal,
    addBarter,
    deleteBarter,
    updateAudit,
    setAudits,
    addContact,
    addMessage,
    exportJSON,
    importJSON,
  };
}
