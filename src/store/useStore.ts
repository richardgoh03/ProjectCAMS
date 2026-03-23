import { create } from 'zustand';
import type { AuditRecord, Settings } from '../types';
import { db } from '../lib/db';

interface StoreState {
  audits: AuditRecord[];
  settings: Settings | null;
  loading: boolean;
  currentUser: string;
  isMobileMenuOpen: boolean;
  
  // Actions
  loadData: () => Promise<void>;
  addAudit: (audit: AuditRecord) => Promise<void>;
  updateAudit: (audit: AuditRecord) => Promise<void>;
  deleteAudit: (id: string) => Promise<void>;
  updateSettings: (settings: Settings) => Promise<void>;
  clearData: () => Promise<void>;
  setCurrentUser: (name: string) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
  audits: [],
  settings: null,
  loading: true,
  currentUser: localStorage.getItem('cams_current_user') || 'Sarah QA',
  isMobileMenuOpen: false,

  loadData: async () => {
    set({ loading: true });
    try {
      const audits = await db.getAudits();
      let settings = await db.getSettings();
      // Seed default settings if empty or using old schema
      if (!settings || Array.isArray(settings.agents)) {
        settings = { 
          agents: { 'SingHealth': [], 'NHG': [], 'NUHS': [] }, 
          auditors: ['Admin QA', 'Senior Auditor (Calibration)'] 
        };
        await db.saveSettings(settings);
      }
      set({ audits, settings, loading: false });
    } catch (err) {
      console.error("Failed to load DB data", err);
      set({ loading: false });
    }
  },

  addAudit: async (audit) => {
    await db.saveAudit(audit);
    set(state => ({ audits: [audit, ...state.audits] }));
  },

  updateAudit: async (audit) => {
    await db.saveAudit(audit);
    set(state => ({
      audits: state.audits.map(a => a.id === audit.id ? audit : a).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }));
  },

  deleteAudit: async (id) => {
    await db.deleteAudit(id);
    set(state => ({
      audits: state.audits.filter(a => a.id !== id)
    }));
  },

  updateSettings: async (settings) => {
    await db.saveSettings(settings);
    set({ settings });
  },
  
  clearData: async () => {
    await db.clearAudits();
    set({ audits: [] });
  },
  
  setCurrentUser: (name: string) => {
    localStorage.setItem('cams_current_user', name);
    set({ currentUser: name });
  },
  
  toggleMobileMenu: () => set(state => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (isOpen: boolean) => set({ isMobileMenuOpen: isOpen })
}));
