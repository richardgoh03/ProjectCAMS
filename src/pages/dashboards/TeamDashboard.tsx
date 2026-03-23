import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTC, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { useStore } from '../../store/useStore';
import { Card } from '../../components/ui';
import { getVerdictHex } from '../../lib/scoring';
import { format, parseISO, startOfWeek } from 'date-fns';

export default function TeamDashboard() {
  const { audits } = useStore();

  const verdictData = useMemo(() => {
    const counts = { Gold: 0, Silver: 0, Bronze: 0, Fail: 0, 'Auto-Fail': 0 };
    audits.forEach(a => { counts[a.verdict]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [audits]);

  const trendData = useMemo(() => {
    // Group by week
    const groups: Record<string, { total: number, count: number }> = {};
    audits.forEach(a => {
       const weekStart = format(startOfWeek(parseISO(a.auditDate)), 'MMM dd');
       if (!groups[weekStart]) groups[weekStart] = { total: 0, count: 0 };
       groups[weekStart].total += a.totalScore;
       groups[weekStart].count += 1;
    });
    return Object.entries(groups).map(([week, data]) => ({
       week,
       avgScore: Number((data.total / data.count).toFixed(1)),
       volume: data.count
    })).reverse(); // older first ideally
  }, [audits]);

  const autoFailData = useMemo(() => {
    const counts: Record<string, number> = {};
    audits.forEach(a => {
       a.autoFailItems.forEach(item => {
         counts[item] = (counts[item] || 0) + 1;
       });
    });
    return Object.entries(counts).map(([item, count]) => ({ item, count })).sort((a,b) => b.count - a.count);
  }, [audits]);

  const avgScore = audits.length ? (audits.reduce((acc, curr) => acc + curr.totalScore, 0) / audits.length).toFixed(1) : 0;
  const afRate = audits.length ? ((audits.filter(a => a.hasAutoFail).length / audits.length) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-6">
       <h1 className="text-2xl font-bold text-navy mb-2">Team Overview</h1>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-navy text-white text-center">
             <div className="text-gray-300 font-semibold mb-2">Total Audits</div>
             <div className="text-4xl font-bold">{audits.length}</div>
          </Card>
          <Card className="p-6 bg-teal text-white text-center">
             <div className="text-gray-200 font-semibold mb-2">Team Avg Score</div>
             <div className="text-4xl font-bold text-gold">{avgScore}%</div>
          </Card>
          <Card className="p-6 bg-fail text-white text-center">
             <div className="text-gray-100 font-semibold mb-2">Auto-Fail Rate</div>
             <div className="text-4xl font-bold">{afRate}%</div>
          </Card>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card className="p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Verdict Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={verdictData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                       {verdictData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={getVerdictHex(entry.name as any)} />
                       ))}
                    </Pie>
                    <RTC />
                    <Legend />
                 </PieChart>
              </ResponsiveContainer>
            </div>
         </Card>

         <Card className="p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Score Trend (Weekly)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <RTC />
                  <Line type="monotone" dataKey="avgScore" stroke="#0B3D4E" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
         </Card>

         <Card className="p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-navy mb-4">Top Auto-Fail Triggers</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={autoFailData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="item" type="category" />
                  <RTC />
                  <Bar dataKey="count" fill="#DC3545" />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </Card>
       </div>
    </div>
  );
}
