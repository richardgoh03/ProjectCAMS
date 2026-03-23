import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, Table, BarChart3, Users, User, Compass, Target, Settings, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { name: 'Audit Form', path: '/', icon: ClipboardList },
  { name: 'Results Table', path: '/table', icon: Table },
  { name: 'Team Dash', path: '/dash/team', icon: Users, isSub: true },
  { name: 'Agent Dash', path: '/dash/agent', icon: User, isSub: true },
  { name: 'Ops Dash', path: '/dash/ops', icon: Compass, isSub: true },
  { name: 'Calibration', path: '/dash/calib', icon: Target, isSub: true },
  { name: 'Coaching', path: '/coaching', icon: ShieldCheck },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-navy text-white flex flex-col h-full overflow-y-auto">
      <div className="p-4 bg-navy font-bold text-lg flex items-center border-b border-teal space-x-2">
        <ClipboardList className="w-6 h-6 text-gold" />
        <span>1FSS CAMS</span>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/');
          const isDashboardHeader = idx === 2; // Inject a header before dashboards
          
          return (
            <div key={item.path}>
              {isDashboardHeader && (
                <div className="px-5 py-2 mt-4 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboards
                </div>
              )}
              <Link
                to={item.path}
                className={clsx(
                  "flex items-center px-5 py-3 text-sm transition-colors",
                  isActive ? "bg-teal text-gold border-r-4 border-gold" : "text-gray-300 hover:bg-teal hover:text-white",
                  item.isSub && "pl-11 py-2 text-xs"
                )}
              >
                {!item.isSub && <item.icon className="w-5 h-5 mr-3" />}
                {item.name}
              </Link>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
