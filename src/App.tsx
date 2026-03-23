import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { useStore } from './store/useStore'

import AuditForm from './pages/AuditForm'
import AuditTable from './pages/AuditTable'
import TeamDashboard from './pages/dashboards/TeamDashboard'
import AgentDashboard from './pages/dashboards/AgentDashboard'
import OpsDashboard from './pages/dashboards/OpsDashboard'
import CalibDashboard from './pages/dashboards/CalibDashboard'
import Coaching from './pages/Coaching'
import Settings from './pages/Settings'

function App() {
  const { loadData, loading } = useStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-bg-light">Loading Data...</div>;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<AuditForm />} />
        <Route path="/table" element={<AuditTable />} />
        <Route path="/dash/team" element={<TeamDashboard />} />
        <Route path="/dash/agent" element={<AgentDashboard />} />
        <Route path="/dash/ops" element={<OpsDashboard />} />
        <Route path="/dash/calib" element={<CalibDashboard />} />
        <Route path="/coaching" element={<Coaching />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App
