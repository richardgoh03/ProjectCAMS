export type Cluster = 'SingHealth' | 'NHG' | 'NUHS';

export type CallCategory = 
  | 'MediSave' 
  | 'MediShield Life' 
  | 'MediFund' 
  | 'Means Testing' 
  | 'Ward Billing' 
  | 'ISP/IP Coordination' 
  | 'MCAF Forms' 
  | 'Payment Arrangements' 
  | 'General Billing Enquiry' 
  | 'Complaint' 
  | 'Other';

export type Verdict = 'Gold' | 'Silver' | 'Bronze' | 'Fail' | 'Auto-Fail';

export type PassFail = 'pass' | 'fail' | null;
export type Score1To5 = 1 | 2 | 3 | 4 | 5 | null;

export interface AuditScores {
  // A1, A4, A5, B4 are PassFail. Others are 1-5.
  A1: PassFail; 
  A2: Score1To5;
  A3: Score1To5;
  A4: PassFail;
  A5: PassFail;

  B1: Score1To5;
  B2: Score1To5;
  B3: Score1To5;
  B4: PassFail;
  B5: Score1To5;

  C1: Score1To5;
  C2: Score1To5;
  C3: Score1To5;
  C4: Score1To5;
  C5: Score1To5;

  D1: Score1To5;
  D2: Score1To5;
  D3: Score1To5;
}

export interface AuditComments {
  A1: string;
  A2: string;
  A3: string;
  A4: string;
  A5: string;
  B1: string;
  B2: string;
  B3: string;
  B4: string;
  B5: string;
  C1: string;
  C2: string;
  C3: string;
  C4: string;
  C5: string;
  D1: string;
  D2: string;
  D3: string;
}

export interface SectionScores {
  A: number;
  B: number;
  C: number;
  D: number;
}

export type CoachingPriority = 'Accuracy' | 'Resolution' | 'Financial Communication' | 'Tone' | 'Process';

export interface AuditRecord {
  id: string;
  auditDate: string; // ISO string 
  auditorName: string;
  agentName: string;
  callRefId: string;
  callDate: string; // YYYY-MM-DD
  callTime: string; // HH:MM
  callDuration: number; // minutes
  cluster: Cluster | '';
  categories: CallCategory[];
  scores: AuditScores;
  comments: AuditComments;
  
  // Computed fields
  sectionScores: SectionScores;
  totalScore: number;
  verdict: Verdict;
  hasAutoFail: boolean;
  autoFailItems: string[];
  
  // Footer
  auditorNotes: string;
  coachingPriorities: CoachingPriority[];
  coachingStatus: 'pending' | 'Discussed' | 'In Progress' | 'Improved' | 'Resolved';
  
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Settings {
  agents: Record<string, string[]>;
  auditors: string[];
}
