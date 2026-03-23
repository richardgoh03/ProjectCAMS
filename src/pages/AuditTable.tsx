import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { Search, Download, Trash2, Eye, XCircle, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, Button, cn } from '../components/ui';
import { getVerdictColor } from '../lib/scoring';


type SortKey = 'auditDate' | 'auditorName' | 'agentName' | 'cluster' | 'totalScore' | 'verdict';
type SortOrder = 'asc' | 'desc';

export default function AuditTable() {
  const navigate = useNavigate();
  const { audits, deleteAudit } = useStore();

  const [search, setSearch] = useState('');
  const [filterCluster, setFilterCluster] = useState('');
  const [filterVerdict, setFilterVerdict] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('auditDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 25;
  const [viewAuditId, setViewAuditId] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc'); // default new sort to desc
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = audits;

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => 
        a.agentName.toLowerCase().includes(q) ||
        a.auditorName.toLowerCase().includes(q) ||
        a.callRefId?.toLowerCase().includes(q)
      );
    }

    // Filter
    if (filterCluster) {
      result = result.filter(a => a.cluster === filterCluster);
    }
    if (filterVerdict) {
      result = result.filter(a => a.verdict === filterVerdict);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let valA: any = a[sortKey];
      let valB: any = b[sortKey];

      // specific logic
      if (sortKey === 'totalScore') { valA = a.totalScore; valB = b.totalScore; }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [audits, search, filterCluster, filterVerdict, sortKey, sortOrder]);

  const pageCount = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this audit record?")) {
      deleteAudit(id);
    }
  };

  const exportExcel = () => {
    if (filteredAndSorted.length === 0) return;

    const dataRows = filteredAndSorted.map(a => ({
      'Audit Date': format(new Date(a.auditDate), 'dd MMM yyyy'),
      'Auditor Name': a.auditorName,
      'Agent Name': a.agentName,
      'Call Ref ID': a.callRefId,
      'Cluster': a.cluster,
      'Total Score (%)': a.totalScore.toFixed(1),
      'Verdict': a.verdict,
      'Auto-Fail Items': a.autoFailItems.join(', '),
      'Sec A (%)': a.sectionScores.A.toFixed(1),
      'Sec B (%)': a.sectionScores.B.toFixed(1),
      'Sec C (%)': a.sectionScores.C.toFixed(1),
      'Sec D (%)': a.sectionScores.D.toFixed(1),
      'Notes': a.auditorNotes
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Audits");
    XLSX.writeFile(workbook, `CAMS_Export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Audit Results Table</h1>
        <Button onClick={exportExcel} variant="outline" className="flex items-center" disabled={filteredAndSorted.length === 0}>
          <Download className="w-4 h-4 mr-2" /> Export to Excel
        </Button>
      </div>

      <Card className="p-4 mb-6 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" placeholder="Search by agent, auditor, or ref id..." 
              value={search} onChange={e => {setSearch(e.target.value); setPage(1);}}
              className="pl-9 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>
          <div className="flex gap-4">
            <select 
              value={filterCluster} onChange={e => {setFilterCluster(e.target.value); setPage(1);}}
              className="border border-gray-300 rounded-md py-2 px-3 min-w-[140px]"
            >
              <option value="">All Clusters</option>
              <option value="SingHealth">SingHealth</option>
              <option value="NHG">NHG</option>
              <option value="NUHS">NUHS</option>
            </select>
            <select 
              value={filterVerdict} onChange={e => {setFilterVerdict(e.target.value); setPage(1);}}
              className="border border-gray-300 rounded-md py-2 px-3 min-w-[140px]"
            >
              <option value="">All Verdicts</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
              <option value="Fail">Fail</option>
              <option value="Auto-Fail">Auto-Fail</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort('auditDate')}>
                Audit Date {sortKey === 'auditDate' && (sortOrder==='asc'?'↑':'↓')}
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort('agentName')}>
                Agent / Auditor {sortKey === 'agentName' && (sortOrder==='asc'?'↑':'↓')}
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort('cluster')}>
                Cluster {sortKey === 'cluster' && (sortOrder==='asc'?'↑':'↓')}
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500">Call Ref ID</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort('totalScore')}>
                Score {sortKey === 'totalScore' && (sortOrder==='asc'?'↑':'↓')}
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort('verdict')}>
                Verdict {sortKey === 'verdict' && (sortOrder==='asc'?'↑':'↓')}
              </th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-500">No records found.</td></tr>
            ) : null}
            {paginatedData.map(a => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                 <td className="px-4 py-3 text-sm text-gray-800">{format(new Date(a.auditDate), 'dd MMM yyyy')}</td>
                 <td className="px-4 py-3 text-sm">
                   <div className="font-semibold text-navy">{a.agentName}</div>
                   <div className="text-xs text-gray-500">{a.auditorName}</div>
                 </td>
                 <td className="px-4 py-3 text-sm text-gray-600">{a.cluster}</td>
                 <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">{a.callRefId}</td>
                 <td className="px-4 py-3 text-sm font-bold text-gray-800">{a.totalScore.toFixed(1)}%</td>
                 <td className="px-4 py-3 text-sm">
                   <span className={cn("inline-block px-2.5 py-1 rounded text-xs font-bold uppercase", getVerdictColor(a.verdict))}>{a.verdict}</span>
                   {a.hasAutoFail && <div className="text-[10px] text-fail mt-1 font-semibold">Failed {a.autoFailItems.join(', ')}</div>}
                 </td>
                 <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                    <button onClick={() => navigate(`/?edit=${a.id}`)} className="p-1.5 text-gray-400 hover:text-navy transition-colors" title="Edit"><Pencil className="w-4 h-4"/></button>
                    <button onClick={() => setViewAuditId(a.id)} className="p-1.5 text-gray-400 hover:text-navy transition-colors ml-2" title="View Details"><Eye className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 text-gray-400 hover:text-fail transition-colors ml-2" title="Delete"><Trash2 className="w-4 h-4"/></button>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      
      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between mt-6">
           <div className="text-sm text-gray-500">
             Showing {(page-1)*itemsPerPage + 1} to {Math.min(page*itemsPerPage, filteredAndSorted.length)} of {filteredAndSorted.length} entries
           </div>
           <div className="flex space-x-2">
             <Button variant="outline" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Previous</Button>
             <span className="flex items-center px-4 font-semibold text-gray-700">Page {page} of {pageCount}</span>
             <Button variant="outline" onClick={() => setPage(p => Math.min(pageCount, p+1))} disabled={page === pageCount}>Next</Button>
           </div>
        </div>
      )}

      {/* Audit Detail Modal */}
      {viewAuditId && (() => {
         const audit = audits.find(a => a.id === viewAuditId);
         if (!audit) return null;
         return (
           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
             <Card className="max-w-3xl w-full max-h-[90vh] flex flex-col bg-white overflow-hidden shadow-2xl">
               <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                 <h2 className="text-xl font-bold text-navy flex items-center"><Eye className="w-5 h-5 mr-2"/> Audit Details: {audit.callRefId}</h2>
                 <button onClick={() => setViewAuditId(null)} className="text-gray-400 hover:text-fail focus:outline-none p-1 transition-colors"><XCircle className="w-6 h-6"/></button>
               </div>
               <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-md border border-gray-100">
                    <div><span className="text-gray-500 font-medium">Agent</span> <br/><span className="font-bold text-navy">{audit.agentName}</span></div>
                    <div><span className="text-gray-500 font-medium">Auditor</span> <br/><span className="font-bold text-navy">{audit.auditorName}</span></div>
                    <div><span className="text-gray-500 font-medium">Cluster</span> <br/><span className="font-bold text-navy">{audit.cluster}</span></div>
                    <div><span className="text-gray-500 font-medium">Score</span> <br/>
                      <span className={cn("font-bold px-2 py-0.5 rounded text-xs inline-block mt-1", getVerdictColor(audit.verdict))}>
                        {audit.totalScore.toFixed(1)}% {audit.verdict}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-teal mb-3 border-b pb-2">Item Scores & Comments</h3>
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                       <table className="w-full text-left text-sm text-gray-700">
                          <thead className="bg-[#0B3D4E] text-white">
                             <tr><th className="p-3 font-semibold w-16">Item</th><th className="p-3 font-semibold w-24">Score</th><th className="p-3 font-semibold">Auditor Comment</th></tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                             {Object.entries(audit.scores).map(([key, value]) => (
                               <tr key={key} className="hover:bg-gray-50">
                                 <td className="p-3 font-mono font-bold text-gray-700">{key}</td>
                                 <td className="p-3">
                                   <span className={cn("px-2.5 py-1 rounded text-xs font-bold uppercase", 
                                      value === 'fail' || value === 1 || value === 2 ? "bg-red-100 text-red-800 border border-red-200" : 
                                      value === 'pass' || value === 4 || value === 5 ? "bg-green-100 text-green-800 border border-green-200" : "bg-gray-100 text-gray-800 border border-gray-200")}>
                                     {value || '-'}
                                   </span>
                                 </td>
                                 <td className="p-3">{audit.comments[key as keyof typeof audit.comments] || <span className="italic text-gray-400">No comment</span>}</td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  </div>
                  
                  {audit.auditorNotes && (
                    <div>
                      <h3 className="font-semibold text-teal mb-2">Overall Summary</h3>
                      <p className="bg-yellow-50 p-4 rounded-md text-sm text-gray-800 border border-yellow-100 leading-relaxed">{audit.auditorNotes}</p>
                    </div>
                  )}
               </div>
             </Card>
           </div>
         );
      })()}
    </div>
  );
}
