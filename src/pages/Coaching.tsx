import { useStore } from '../store/useStore';
import { Card, cn } from '../components/ui';
import { format, parseISO } from 'date-fns';

export default function Coaching() {
  const { audits, updateAudit } = useStore();
  
  const coachingAudits = audits.filter(a => a.coachingPriorities.length > 0)
    .sort((a,b) => new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime());

  const handleStatusChange = (id: string, newStatus: any) => {
    const audit = audits.find(a => a.id === id);
    if (!audit) return;
    updateAudit({ ...audit, coachingStatus: newStatus });
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-6">
       <h1 className="text-2xl font-bold text-navy mb-2">Coaching Tracker</h1>

       {coachingAudits.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">No audits currently flagged with coaching priorities.</Card>
       ) : (
         <div className="space-y-4">
           {coachingAudits.map(a => (
             <Card key={a.id} className="p-5 flex flex-col md:flex-row gap-6 border-l-4 border-l-teal">
                <div className="flex-1">
                   <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-lg text-navy mr-2">{a.agentName}</span>
                        <span className="text-sm text-gray-500">({a.callRefId} @ {format(parseISO(a.auditDate), 'MMM dd')})</span>
                      </div>
                      <span className={cn("px-2.5 py-1 text-xs font-bold rounded uppercase", getStatusColor(a.coachingStatus))}>
                        {a.coachingStatus}
                      </span>
                   </div>
                   
                   <p className="text-sm text-gray-800 mb-3">{a.auditorNotes || <span className="italic">No written notes.</span>}</p>
                   
                   <div className="flex flex-wrap gap-2">
                     {a.coachingPriorities.map(p => (
                       <span key={p} className="text-xs font-semibold bg-gray-100 border border-gray-200 text-gray-700 px-2 py-1 rounded">{p}</span>
                     ))}
                   </div>
                </div>

                <div className="md:w-48 shrink-0 flex flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4">
                   <span className="text-xs uppercase font-bold text-gray-400 mb-1">Update Status:</span>
                   <select 
                     value={a.coachingStatus} 
                     onChange={e => handleStatusChange(a.id, e.target.value)}
                     className="w-full text-sm border-gray-300 rounded p-1.5 focus:ring-1 focus:ring-navy"
                   >
                     <option value="pending">Pending</option>
                     <option value="Discussed">Discussed</option>
                     <option value="In Progress">In Progress</option>
                     <option value="Improved">Improved</option>
                     <option value="Resolved">Resolved</option>
                   </select>
                </div>
             </Card>
           ))}
         </div>
       )}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-gray-100 text-gray-600';
    case 'Discussed': return 'bg-blue-100 text-blue-800';
    case 'In Progress': return 'bg-yellow-100 text-yellow-800';
    case 'Improved': return 'bg-teal/20 text-teal';
    case 'Resolved': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-600';
  }
}
