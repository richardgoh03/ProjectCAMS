import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { 
  AuditRecord, AuditScores, AuditComments, Cluster, CallCategory, CoachingPriority, SectionScores
} from '../types';
import { FORM_SECTIONS, CALL_CATEGORIES, COACHING_PRIORITIES } from '../lib/constants';
import { calculateScores, getVerdictColor } from '../lib/scoring';
import { Card, Button, cn } from '../components/ui';

const initialScores: AuditScores = {
  A1: null, A2: null, A3: null, A4: null, A5: null,
  B1: null, B2: null, B3: null, B4: null, B5: null,
  C1: null, C2: null, C3: null, C4: null, C5: null,
  D1: null, D2: null, D3: null
};

const initialComments: AuditComments = {
  A1: '', A2: '', A3: '', A4: '', A5: '',
  B1: '', B2: '', B3: '', B4: '', B5: '',
  C1: '', C2: '', C3: '', C4: '', C5: '',
  D1: '', D2: '', D3: ''
};

export default function AuditForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { settings, addAudit, updateAudit, updateSettings, audits, currentUser, setCurrentUser } = useStore();

  const [auditDate, setAuditDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [auditorName, setAuditorName] = useState(currentUser);
  const [agentName, setAgentName] = useState('');
  const [callRefId, setCallRefId] = useState('');
  const [callDate, setCallDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [callTime, setCallTime] = useState(format(new Date(), 'HH:mm'));
  const [callDuration, setCallDuration] = useState<number | ''>('');
  const [cluster, setCluster] = useState<Cluster | ''>('');
  const [categories, setCategories] = useState<CallCategory[]>([]);

  const [scores, setScores] = useState<AuditScores>(initialScores);
  const [comments, setComments] = useState<AuditComments>(initialComments);
  
  const [auditorNotes, setAuditorNotes] = useState('');
  const [coachingPriorities, setCoachingPriorities] = useState<CoachingPriority[]>([]);

  useEffect(() => {
    if (editId && audits.length > 0) {
       const existing = audits.find(a => a.id === editId);
       if (existing) {
         setAuditDate(existing.auditDate);
         setAuditorName(existing.auditorName);
         setAgentName(existing.agentName);
         setCallRefId(existing.callRefId);
         setCallDate(existing.callDate);
         setCallTime(existing.callTime);
         setCallDuration(existing.callDuration);
         setCluster(existing.cluster);
         setCategories(existing.categories);
         setScores(existing.scores);
         setComments(existing.comments);
         setAuditorNotes(existing.auditorNotes);
         setCoachingPriorities(existing.coachingPriorities);
       }
    }
  }, [editId, audits]);

  const { sectionScores, totalScore, verdict, hasAutoFail, autoFailItems } = useMemo(() => calculateScores(scores), [scores]);

  const availableAgents = useMemo(() => {
    if (!cluster) return [];
    const list = new Set<string>();
    if (settings?.agents[cluster]) settings.agents[cluster].forEach(a => list.add(a));
    if (audits) audits.filter(a => a.cluster === cluster).forEach(a => list.add(a.agentName));
    return Array.from(list).sort();
  }, [cluster, settings, audits]);

  const availableAuditors = useMemo(() => {
    const list = new Set<string>();
    if (settings?.auditors) settings.auditors.forEach(a => list.add(a));
    if (audits) audits.forEach(a => list.add(a.auditorName));
    return Array.from(list).sort();
  }, [settings, audits]);

  const scoredCount = Object.values(scores).filter(v => v !== null).length;
  const hasRequiredHeaders = auditorName && agentName && callRefId && cluster;
  const isComplete = hasRequiredHeaders && (hasAutoFail || scoredCount === 18);

  const handleScoreChange = (id: keyof AuditScores, val: any) => {
    setScores(prev => ({ ...prev, [id]: val }));
  };

  const handleCommentChange = (id: keyof AuditComments, val: string) => {
    setComments(prev => ({ ...prev, [id]: val }));
  };

  const toggleCategory = (cat: CallCategory) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const togglePriority = (pri: CoachingPriority) => {
    setCoachingPriorities(prev => prev.includes(pri) ? prev.filter(p => p !== pri) : [...prev, pri]);
  };

  const missingComments: string[] = [];
  Object.keys(scores).forEach(key => {
    const k = key as keyof AuditScores;
    const score = scores[k];
    const comment = comments[k];
    if (score === 'fail' && !comment.trim()) missingComments.push(k);
    if (typeof score === 'number' && score <= 2 && !comment.trim()) missingComments.push(k);
  });

  const canSubmit = isComplete && missingComments.length === 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    // Automatically capture newly typed agents and auditors into the correct clusters
    if (settings) {
       let updated = false;
       const nextSettings = { ...settings, agents: { ...settings.agents }, auditors: [...settings.auditors] };
       
       if (cluster && agentName && !nextSettings.agents[cluster]?.includes(agentName)) {
          if (!nextSettings.agents[cluster]) nextSettings.agents[cluster] = [];
          nextSettings.agents[cluster].push(agentName);
          updated = true;
       }
       if (auditorName && !nextSettings.auditors.includes(auditorName)) {
          nextSettings.auditors.push(auditorName);
          updated = true;
       }
       
       if (updated) {
          await updateSettings(nextSettings);
       }
    }
    
    const record: AuditRecord = {
      id: editId || uuidv4(),
      auditDate, auditorName, agentName, callRefId, callDate, callTime,
      callDuration: Number(callDuration), cluster: cluster as Cluster, categories,
      scores, comments,
      sectionScores, totalScore, verdict, hasAutoFail, autoFailItems,
      auditorNotes, coachingPriorities, 
      coachingStatus: editId ? (audits.find(a => a.id === editId)?.coachingStatus || 'pending') : 'pending',
      createdAt: editId ? (audits.find(a => a.id === editId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (editId) {
      await updateAudit(record);
    } else {
      await addAudit(record);
    }
    if (auditorName && auditorName !== currentUser) {
      setCurrentUser(auditorName);
    }
    navigate('/table');
  };

  return (
    <div className="pb-32 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-navy mb-6">{editId ? 'Edit Call Audit' : 'New Call Audit'}</h1>
      
      {/* Header Fields */}
      <Card className="p-6 mb-8 border-t-4 border-t-navy">
        <h2 className="text-lg font-semibold text-teal mb-4 border-b pb-2">Call Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audit Date</label>
            <input type="date" value={auditDate} onChange={e => setAuditDate(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auditor Name</label>
            <input 
              type="text" 
              list="auditor-names"
              value={auditorName} 
              onChange={e => setAuditorName(e.target.value)} 
              className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-white border focus:ring-1 focus:ring-navy outline-none"
              placeholder="Type or select Auditor..."
            />
            <datalist id="auditor-names">
              {availableAuditors.map(a => <option key={a} value={a} />)}
            </datalist>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Cluster</label>
             <select value={cluster} onChange={e => {setCluster(e.target.value as Cluster); setAgentName('');}} className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-white border">
               <option value="">Select Cluster...</option>
               <option value="SingHealth">SingHealth</option>
               <option value="NHG">NHG</option>
               <option value="NUHS">NUHS</option>
             </select>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
            <input 
              type="text" 
              list="agent-names"
              value={agentName} 
              onChange={e => setAgentName(e.target.value)} 
              disabled={!cluster}
              className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-white border focus:ring-1 focus:ring-navy outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder={cluster ? `Type new or select ${cluster} Agent...` : "Select Cluster First"}
            />
            <datalist id="agent-names">
              {availableAgents.map(a => <option key={a} value={a} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Call Ref ID</label>
            <input type="text" placeholder="e.g. REF-12345" value={callRefId} onChange={e => setCallRefId(e.target.value)} className="w-full font-mono border-gray-300 rounded-md shadow-sm p-2 bg-white border" />
          </div>
          <div className="grid grid-cols-2 gap-2">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Call Date</label>
                <input type="date" value={callDate} onChange={e => setCallDate(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-white border" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input type="time" value={callTime} onChange={e => setCallTime(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-white border" />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
            <input type="number" min="0" value={callDuration} onChange={e => setCallDuration(e.target.value ? Number(e.target.value) : '')} className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-white border" />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Call Category (Tags)</label>
          <div className="flex flex-wrap gap-2">
            {CALL_CATEGORIES.map(cat => {
              const selected = categories.includes(cat as CallCategory);
              return (
                <button
                  key={cat} type="button" onClick={() => toggleCategory(cat as CallCategory)}
                  className={cn("px-3 py-1 rounded-full text-xs font-semibold transition-colors border", 
                    selected ? "bg-teal text-white border-teal" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100")}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Sections & Items */}
      <div className="space-y-8">
        {FORM_SECTIONS.map((section) => {
          const currentSectionScore = sectionScores[section.id as keyof SectionScores];
          const sectionColor = section.id === 'D' ? 'border-[#1A3A2A]' : (section.id === 'C' ? 'border-teal' : 'border-navy');
          const headerBg = section.id === 'D' ? 'bg-[#1A3A2A]' : (section.id === 'C' ? 'bg-teal' : 'bg-navy');
          
          return (
          <Card key={section.id} className={cn("border-t-4", sectionColor)}>
            <div className={cn("px-6 py-3 text-white flex justify-between items-center", headerBg)}>
              <h2 className="text-lg font-bold">{section.title} <span className="text-sm font-normal opacity-75 ml-2">({section.weight})</span></h2>
              <div className="font-mono bg-black/20 px-3 py-1 rounded">
                Score: {currentSectionScore.toFixed(1)}%
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {section.items.map(item => {
                const k = item.id as keyof AuditScores;
                const score = scores[k];
                const comment = comments[k];
                const isMandatoryComment = (score === 'fail' || (typeof score === 'number' && score <= 2));
                const missing = isMandatoryComment && !comment.trim();

                return (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono text-xs font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded">{item.id}</span>
                          {item.type === 'auto-fail' && <span className="text-[10px] font-bold tracking-wider uppercase text-fail bg-red-100 px-2 py-0.5 rounded border border-red-200">Auto-Fail Element</span>}
                          <span className="font-semibold text-gray-900">{item.name}</span>
                        </div>
                        <p className="text-sm text-gray-500 max-w-xl">{item.desc}</p>
                      </div>
                      
                      <div className="w-full lg:w-48 xl:w-64 shrink-0 flex items-center justify-start lg:justify-end">
                        {item.type === 'auto-fail' ? (
                          <div className="flex rounded-md shadow-sm overflow-hidden bg-white border border-gray-300">
                             <button type="button" onClick={() => handleScoreChange(k, 'pass')} className={cn("px-4 py-2 text-sm font-medium transition-colors border-r border-gray-200 focus:outline-none", score === 'pass' ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100")}>
                                Pass
                             </button>
                             <button type="button" onClick={() => handleScoreChange(k, 'fail')} className={cn("px-4 py-2 text-sm font-medium transition-colors focus:outline-none", score === 'fail' ? "bg-fail text-white" : "text-gray-700 hover:bg-gray-100")}>
                                Fail
                             </button>
                          </div>
                        ) : (
                          <div className="flex rounded-md shadow-sm border border-gray-300 bg-white">
                            {[1,2,3,4,5].map(val => {
                              let bg = "bg-white text-gray-700 hover:bg-gray-100";
                              if (score === val) {
                                if (val === 1) bg = "bg-red-600 text-white";
                                else if (val === 2) bg = "bg-orange-500 text-white";
                                else if (val === 3) bg = "bg-yellow-500 text-white";
                                else if (val === 4) bg = "bg-green-500 text-white";
                                else bg = "bg-[#1A3A2A] text-white";
                              }
                              return (
                                <button key={val} type="button" onClick={() => handleScoreChange(k, val)} className={cn("w-10 h-10 flex items-center justify-center font-bold text-sm transition-colors focus:outline-none border-r border-gray-200 last:border-r-0", bg)}>
                                  {val}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 pl-[3.25rem]">
                       <div className="relative">
                         <textarea 
                           placeholder={isMandatoryComment ? "Comment required due to low score or fail..." : "Optional comment..."} 
                           value={comment} onChange={e => handleCommentChange(k, e.target.value)} 
                           className={cn("w-full text-sm p-2 rounded border focus:ring-1 outline-none min-h-[60px] resize-y", missing ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-navy focus:ring-navy")}
                         />
                         {missing && <span className="absolute -bottom-5 left-0 text-xs text-fail font-semibold flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Mandatory comment missing</span>}
                       </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )})}
      </div>

      {/* Footer Notes & Coaching */}
      <Card className="p-6 mt-8 mb-8 border-t-4 border-gold">
        <h2 className="text-lg font-semibold text-teal mb-4 border-b pb-2">Auditor Notes & Coaching</h2>
        
        <div className="mb-4">
           <label className="block text-sm font-medium text-gray-700 mb-2">Overall Summary</label>
           <textarea value={auditorNotes} onChange={e => setAuditorNotes(e.target.value)} rows={4} className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-navy focus:border-navy" placeholder="Write overall summary, strengths, and areas to improve..."></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Coaching Priorities for Next Session</label>
          <div className="flex flex-wrap gap-2">
            {COACHING_PRIORITIES.map(pri => {
              const selected = coachingPriorities.includes(pri as CoachingPriority);
              return (
                <button
                  key={pri} type="button" onClick={() => togglePriority(pri as CoachingPriority)}
                  className={cn("px-3 py-1.5 rounded-md text-sm transition-colors border font-medium flex items-center", 
                    selected ? "bg-navy text-white border-navy" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")}
                >
                  {selected && <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                  {pri}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Sticky Score Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 flex items-center justify-between z-10 px-8">
        <div className="flex items-center space-x-8">
           <div>
             <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Progress</div>
             <div className="font-mono font-bold text-navy flex items-center">
               <span className={scoredCount === 18 ? "text-green-600" : ""}>{scoredCount}</span> / 18
             </div>
           </div>
           
           <div className="h-10 border-r border-gray-300"></div>

           <div>
             <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">A: Accur.</div>
             <div className="font-mono font-bold">{sectionScores.A.toFixed(1)}%</div>
           </div>
           <div>
             <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">B: Resol.</div>
             <div className="font-mono font-bold">{sectionScores.B.toFixed(1)}%</div>
           </div>
           <div>
             <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">C: Finan.</div>
             <div className="font-mono font-bold">{sectionScores.C.toFixed(1)}%</div>
           </div>
           <div>
             <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">D: Serv.</div>
             <div className="font-mono font-bold">{sectionScores.D.toFixed(1)}%</div>
           </div>

           <div className="h-10 border-r border-gray-300"></div>

           <div className="flex items-center space-x-4">
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider text-right mb-1">Total Score</div>
                <div className="font-mono font-bold text-2xl leading-none">{totalScore.toFixed(1)}%</div>
              </div>
              <div className={cn("px-4 py-2 rounded-md font-bold uppercase tracking-widest border border-white/20 shadow-sm text-white", getVerdictColor(verdict))}>
                {verdict}
              </div>
           </div>
        </div>
        
        <div className="flex items-center space-x-4">
           {!isComplete && !hasAutoFail && <span className="text-sm text-gray-500 italic">Fill all 18 items & headers to submit</span>}
           {!isComplete && hasAutoFail && <span className="text-sm text-fail italic font-semibold">Fill headers to save auto-fail</span>}
           {isComplete && missingComments.length > 0 && <span className="text-sm text-fail italic font-semibold">Missing mandatory comments</span>}
           <Button onClick={() => window.scrollTo(0, 0)} variant="secondary">Reset</Button>
           <Button onClick={handleSubmit} disabled={!canSubmit} className="shadow-md">{editId ? 'Update Audit Record' : 'Save Audit Record'}</Button>
        </div>
      </div>
    </div>
  );
}
