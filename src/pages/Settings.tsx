import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button } from '../components/ui';

export default function Settings() {
  const { settings, updateSettings, clearData } = useStore();
  
  const [shAgents, setShAgents] = useState("");
  const [nhgAgents, setNhgAgents] = useState("");
  const [nuhsAgents, setNuhsAgents] = useState("");
  const [auditors, setAuditors] = useState("");

  useEffect(() => {
    if (settings && !Array.isArray(settings.agents)) {
       setShAgents((settings.agents['SingHealth'] || []).join('\n'));
       setNhgAgents((settings.agents['NHG'] || []).join('\n'));
       setNuhsAgents((settings.agents['NUHS'] || []).join('\n'));
       setAuditors(settings.auditors.join('\n'));
    }
  }, [settings]);

  const handleSave = () => {
    const newSettings = {
       agents: {
         'SingHealth': shAgents.split('\n').map(s=>s.trim()).filter(Boolean),
         'NHG': nhgAgents.split('\n').map(s=>s.trim()).filter(Boolean),
         'NUHS': nuhsAgents.split('\n').map(s=>s.trim()).filter(Boolean),
       },
       auditors: auditors.split('\n').map(s=>s.trim()).filter(Boolean),
    };
    updateSettings(newSettings);
    alert('Settings saved successfully.');
  };

  const handleClear = () => {
    if (window.confirm('CRITICAL: Are you sure you want to permanently delete ALL audit records data?')) {
       clearData();
       alert('All audit data has been cleared.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-6">
      <h1 className="text-2xl font-bold text-navy mb-4">Application Settings</h1>

      <Card className="p-6">
         <h2 className="text-lg font-semibold text-teal mb-4 border-b pb-2">Manage Lists</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">SingHealth Agents</label>
               <textarea 
                 value={shAgents} onChange={e => setShAgents(e.target.value)}
                 rows={10} className="w-full border border-gray-300 rounded focus:ring-navy focus:border-navy p-2 text-sm font-mono whitespace-pre"
                 placeholder="One per row"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">NHG Agents</label>
               <textarea 
                 value={nhgAgents} onChange={e => setNhgAgents(e.target.value)}
                 rows={10} className="w-full border border-gray-300 rounded focus:ring-navy focus:border-navy p-2 text-sm font-mono whitespace-pre"
                 placeholder="One per row"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">NUHS Agents</label>
               <textarea 
                 value={nuhsAgents} onChange={e => setNuhsAgents(e.target.value)}
                 rows={10} className="w-full border border-gray-300 rounded focus:ring-navy focus:border-navy p-2 text-sm font-mono whitespace-pre"
                 placeholder="One per row"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Auditors</label>
               <textarea 
                 value={auditors} onChange={e => setAuditors(e.target.value)}
                 rows={10} className="w-full border border-gray-300 rounded focus:ring-navy focus:border-navy p-2 text-sm font-mono whitespace-pre"
                 placeholder="One per row"
               />
            </div>
         </div>
         <div className="mt-4 flex justify-end">
            <Button onClick={handleSave}>Save Lists</Button>
         </div>
      </Card>

      <Card className="p-6 border-t-4 border-fail bg-red-50">
         <h2 className="text-lg font-semibold text-fail mb-2">Danger Zone</h2>
         <p className="text-sm text-gray-700 mb-4">Clear all audit data from local storage. This action cannot be undone unless you exported a backup via the Audit Table.</p>
         <Button onClick={handleClear} variant="danger">Wipe Database</Button>
      </Card>
    </div>
  );
}
