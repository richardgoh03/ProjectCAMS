import type { AuditScores, SectionScores, Verdict } from '../types';

const WEIGHTS = {
  A: 0.35,
  B: 0.30,
  C: 0.25,
  D: 0.10
};

export const SECTION_ITEMS = {
  A: ['A2', 'A3'] as const,
  B: ['B1', 'B2', 'B3', 'B5'] as const,
  C: ['C1', 'C2', 'C3', 'C4', 'C5'] as const,
  D: ['D1', 'D2', 'D3'] as const,
};

export const AUTO_FAIL_ITEMS = ['A1', 'A4', 'A5', 'B4'] as const;

export function calculateScores(scores: AuditScores): {
  sectionScores: SectionScores;
  totalScore: number;
  verdict: Verdict;
  hasAutoFail: boolean;
  autoFailItems: string[];
} {
  const sectionScores: SectionScores = { A: 0, B: 0, C: 0, D: 0 };
  let totalScore = 0;
  
  const calcSection = (section: 'A'|'B'|'C'|'D', items: readonly (keyof AuditScores)[]) => {
    let sum = 0;
    let count = 0;
    
    items.forEach(item => {
      const val = scores[item];
      if (typeof val === 'number') {
        sum += val;
        count++;
      }
    });

    if (count === 0) return 0; // If nothing scored yet
    
    // average out of 5
    const avg = sum / count;
    const percentage = (avg / 5) * 100;
    sectionScores[section] = percentage;
    
    return percentage * WEIGHTS[section];
  };

  totalScore += calcSection('A', SECTION_ITEMS.A);
  totalScore += calcSection('B', SECTION_ITEMS.B);
  totalScore += calcSection('C', SECTION_ITEMS.C);
  totalScore += calcSection('D', SECTION_ITEMS.D);

  const autoFailItems: string[] = [];
  let hasAutoFail = false;

  AUTO_FAIL_ITEMS.forEach(item => {
    if (scores[item] === 'fail') {
      hasAutoFail = true;
      autoFailItems.push(item);
    }
  });

  let verdict: Verdict = 'Fail';
  if (hasAutoFail) {
    verdict = 'Auto-Fail';
  } else if (totalScore >= 90) {
    verdict = 'Gold';
  } else if (totalScore >= 75) {
    verdict = 'Silver';
  } else if (totalScore >= 60) {
    verdict = 'Bronze';
  } else {
    verdict = 'Fail';
  }

  // Handle case where form is empty
  let scoredCount = 0;
  Object.values(scores).forEach(v => { if (v !== null) scoredCount++ });
  if (scoredCount === 0) verdict = 'Fail'; // Or keep it hidden until complete

  return {
    sectionScores,
    totalScore,
    verdict,
    hasAutoFail,
    autoFailItems
  };
}

export function getVerdictColor(verdict: Verdict | null): string {
  switch (verdict) {
    case 'Gold': return 'bg-gold text-navy';
    case 'Silver': return 'bg-silver text-navy';
    case 'Bronze': return 'bg-bronze text-white';
    case 'Fail': return 'bg-fail text-white';
    case 'Auto-Fail': return 'bg-fail text-white border-2 border-red-900';
    default: return 'bg-gray-200 text-gray-500';
  }
}

export function getVerdictHex(verdict: Verdict | null): string {
  switch (verdict) {
    case 'Gold': return '#FFD700';
    case 'Silver': return '#C0C0C0';
    case 'Bronze': return '#CD7F32';
    case 'Fail': return '#DC3545';
    case 'Auto-Fail': return '#DC3545';
    default: return '#E5E7EB';
  }
}
