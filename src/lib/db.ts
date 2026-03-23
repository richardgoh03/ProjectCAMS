import localforage from 'localforage';
import type { AuditRecord, Settings } from '../types';

// Initialize stores
const auditStore = localforage.createInstance({
  name: 'CAMS_DB',
  storeName: 'audits'
});

const settingsStore = localforage.createInstance({
  name: 'CAMS_DB',
  storeName: 'settings'
});

export const db = {
  // Audits
  async getAudits(): Promise<AuditRecord[]> {
    const audits: AuditRecord[] = [];
    await auditStore.iterate((value: AuditRecord) => {
      audits.push(value);
    });
    // Sort by descending createdAt usually
    return audits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  async saveAudit(audit: AuditRecord): Promise<void> {
    await auditStore.setItem(audit.id, audit);
  },
  
  async deleteAudit(id: string): Promise<void> {
    await auditStore.removeItem(id);
  },
  
  async clearAudits(): Promise<void> {
    await auditStore.clear();
  },

  // Settings
  async getSettings(): Promise<Settings | null> {
    return await settingsStore.getItem<Settings>('app_settings');
  },
  
  async saveSettings(settings: Settings): Promise<void> {
    await settingsStore.setItem('app_settings', settings);
  }
};
