import { useMemo } from 'react';
import { ResponsiveContainer, Tooltip as RTC, BarChart, Bar, Legend, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useStore } from '../../store/useStore';
import { Card } from '../../components/ui';

export default function OpsDashboard() {
  const { audits } = useStore();

  const clusterData = useMemo(() => {
    const clusters = { 'SingHealth': { total: 0, count: 0 }, 'NHG': { total: 0, count: 0 }, 'NUHS': { total: 0, count: 0 } };
    audits.forEach(a => {
       if (clusters[a.cluster as keyof typeof clusters]) {
          clusters[a.cluster as keyof typeof clusters].total += a.totalScore;
          clusters[a.cluster as keyof typeof clusters].count += 1;
       }
    });
    return Object.entries(clusters).map(([name, data]) => ({
       name,
       avgScore: data.count > 0 ? Number((data.total / data.count).toFixed(1)) : 0,
       volume: data.count
    }));
  }, [audits]);

  const categoryData = useMemo(() => {
    const categories: Record<string, { total: 0, count: 0 }> = {};
    audits.forEach(a => {
       a.categories.forEach(cat => {
         if (!categories[cat]) categories[cat] = { total: 0, count: 0 };
         categories[cat].total += a.totalScore;
         categories[cat].count += 1;
       });
    });
    return Object.entries(categories)
      .map(([name, data]) => ({ name, avgScore: Number((data.total / data.count).toFixed(1)), volume: data.count }))
      .sort((a,b) => a.avgScore - b.avgScore);
  }, [audits]);

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-6">
       <h1 className="text-2xl font-bold text-navy mb-2">Operational Insights</h1>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Cluster Performance Comparison</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clusterData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <RTC />
                  <Legend />
                  <Bar dataKey="avgScore" name="Avg Score (%)" fill="#1A3A5C" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 lg:row-span-2">
            <h2 className="text-lg font-semibold text-navy mb-4">Score by Call Category</h2>
            <div className="h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}} />
                  <RTC />
                  <Bar dataKey="avgScore" name="Avg Score (%)" fill="#0B3D4E" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Category Volume</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...categoryData].sort((a,b)=>b.volume-a.volume)} margin={{ top: 5, right: 30, left: -20, bottom: 55 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{fontSize: 10}} height={60} />
                  <YAxis />
                  <RTC />
                  <Bar dataKey="volume" name="Call Volume" fill="#CD7F32" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
       </div>
    </div>
  );
}
