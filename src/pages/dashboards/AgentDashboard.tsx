import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RTC, BarChart, Bar, Legend } from 'recharts';
import { useStore } from '../../store/useStore';
import { Card, cn } from '../../components/ui';
import { getVerdictColor } from '../../lib/scoring';
import { format, parseISO } from 'date-fns';

export default function AgentDashboard() {
  const { audits, settings } = useStore();
  
  // Flatten agents for dropdown
  const allAgents = useMemo(() => {
    if (!settings || Array.isArray(settings.agents)) return [];
    return Object.entries(settings.agents).flatMap(([cluster, agents]) => 
      agents.map(a => ({ name: a, cluster }))
    );
  }, [settings]);

  const [selectedAgent, setSelectedAgent] = useState<string>(allAgents[0]?.name || '');

  const agentAudits = useMemo(() => {
    return audits.filter(a => a.agentName === selectedAgent).sort((a,b) => new Date(a.auditDate).getTime() - new Date(b.auditDate).getTime());
  }, [audits, selectedAgent]);

  const trendData = useMemo(() => {
    return agentAudits.map(a => ({
       date: format(parseISO(a.auditDate), 'MMM dd'),
       score: a.totalScore,
       verdict: a.verdict
    }));
  }, [agentAudits]);

  const sectionCompareData = useMemo(() => {
    if (!agentAudits.length) return [];
    const agentAvg = {
      A: agentAudits.reduce((acc, curr) => acc + curr.sectionScores.A, 0) / agentAudits.length,
      B: agentAudits.reduce((acc, curr) => acc + curr.sectionScores.B, 0) / agentAudits.length,
      C: agentAudits.reduce((acc, curr) => acc + curr.sectionScores.C, 0) / agentAudits.length,
      D: agentAudits.reduce((acc, curr) => acc + curr.sectionScores.D, 0) / agentAudits.length,
    };
    const teamAvg = {
      A: audits.reduce((acc, curr) => acc + curr.sectionScores.A, 0) / (audits.length||1),
      B: audits.reduce((acc, curr) => acc + curr.sectionScores.B, 0) / (audits.length||1),
      C: audits.reduce((acc, curr) => acc + curr.sectionScores.C, 0) / (audits.length||1),
      D: audits.reduce((acc, curr) => acc + curr.sectionScores.D, 0) / (audits.length||1),
    };

    return [
      { name: 'Sec A: Accuracy', Agent: Number(agentAvg.A.toFixed(1)), Team: Number(teamAvg.A.toFixed(1)) },
      { name: 'Sec B: Resolution', Agent: Number(agentAvg.B.toFixed(1)), Team: Number(teamAvg.B.toFixed(1)) },
      { name: 'Sec C: Financial', Agent: Number(agentAvg.C.toFixed(1)), Team: Number(teamAvg.C.toFixed(1)) },
      { name: 'Sec D: Service', Agent: Number(agentAvg.D.toFixed(1)), Team: Number(teamAvg.D.toFixed(1)) }
    ];
  }, [agentAudits, audits]);

  const avgScore = agentAudits.length ? (agentAudits.reduce((acc, curr) => acc + curr.totalScore, 0) / agentAudits.length).toFixed(1) : 0;

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-6">
       <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-navy">Agent Performance</h1>
          <select 
            value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm p-2 bg-white border min-w-[200px]"
          >
            {allAgents.map(a => <option key={a.name} value={a.name}>{a.name} ({a.cluster})</option>)}
          </select>
       </div>

       {agentAudits.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">No audits found for selected agent.</Card>
       ) : (
         <>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="p-6 text-center">
                 <div className="text-gray-500 font-semibold mb-1 text-sm uppercase tracking-wider">Total Audits</div>
                 <div className="text-3xl font-bold text-navy">{agentAudits.length}</div>
              </Card>
              <Card className="p-6 text-center">
                 <div className="text-gray-500 font-semibold mb-1 text-sm uppercase tracking-wider">Avg Score</div>
                 <div className="text-3xl font-bold text-navy">{avgScore}%</div>
              </Card>
              <Card className="p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                 <div className="text-gray-500 font-semibold mb-1 text-sm uppercase tracking-wider">Latest Verdict</div>
                 <div className="flex justify-center mt-2">
                   <span className={cn("inline-block px-3 py-1 rounded text-sm font-bold uppercase", getVerdictColor(agentAudits[agentAudits.length-1].verdict))}>
                     {agentAudits[agentAudits.length-1].verdict}
                   </span>
                 </div>
              </Card>
              <Card className="p-6 text-center text-fail bg-red-50">
                 <div className="font-semibold mb-1 text-sm uppercase tracking-wider">Auto-Fails</div>
                 <div className="text-3xl font-bold">{agentAudits.filter(a => a.hasAutoFail).length}</div>
              </Card>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                 <h2 className="text-lg font-semibold text-navy mb-4">Score Trend</h2>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis dataKey="date" />
                       <YAxis domain={[0, 100]} />
                       <RTC />
                       <Line type="stepAfter" dataKey="score" stroke="#1A3A5C" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
              </Card>

              <Card className="p-6">
                 <h2 className="text-lg font-semibold text-navy mb-4">Section Performance vs Team</h2>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={sectionCompareData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis dataKey="name" tick={{fontSize: 10}} />
                       <YAxis domain={[0, 100]} />
                       <RTC />
                       <Legend />
                       <Bar dataKey="Agent" fill="#0B3D4E" />
                       <Bar dataKey="Team" fill="#CD7F32" />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
              </Card>
              
              <Card className="p-6 lg:col-span-2">
                 <h2 className="text-lg font-semibold text-navy mb-4">Recent Coaching Notes</h2>
                 <div className="space-y-4">
                   {agentAudits.slice().reverse().slice(0, 5).map(a => (
                      <div key={a.id} className="border-l-4 border-teal pl-4 py-2">
                         <div className="text-xs text-gray-500 mb-1">{format(parseISO(a.auditDate), 'MMM dd, yyyy')} • {a.callRefId} • {a.verdict}</div>
                         <div className="text-sm text-gray-800">{a.auditorNotes || <span className="italic text-gray-400">No notes provided.</span>}</div>
                         {a.coachingPriorities.length > 0 && (
                           <div className="mt-2 flex gap-2">
                             {a.coachingPriorities.map(p => <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{p}</span>)}
                           </div>
                         )}
                      </div>
                   ))}
                 </div>
              </Card>
           </div>
         </>
       )}
    </div>
  );
}
