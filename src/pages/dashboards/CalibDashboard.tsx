import { Card } from '../../components/ui';

export default function CalibDashboard() {
  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-6">
       <h1 className="text-2xl font-bold text-navy mb-2">Calibration View</h1>
       <Card className="p-12 text-center text-gray-500">
          <p className="mb-4 text-lg">Cross-auditor calibration feature is currently under construction.</p>
          <p className="text-sm">Future updates will display matching audits (by Call Ref ID) scoped to multiple auditors to compare score variances and Inter-Rater Reliability (IRR).</p>
       </Card>
    </div>
  );
}
