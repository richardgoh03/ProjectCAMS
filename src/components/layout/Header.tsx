import { Menu } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function Header() {
  const { currentUser, toggleMobileMenu } = useStore();
  
  const initials = currentUser.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0 shadow-sm relative z-10 w-full overflow-hidden">
      <div className="flex items-center space-x-3 truncate">
        <button onClick={toggleMobileMenu} className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none shrink-0">
          <Menu className="w-6 h-6" />
        </button>
        <div className="font-semibold text-navy text-lg hidden sm:block truncate">
          Call Audit Management System
        </div>
        <div className="font-semibold text-navy text-lg block sm:hidden truncate">
          CAMS
        </div>
      </div>
      <div className="flex items-center space-x-3 shrink-0 ml-4">
        <div className="text-sm text-gray-600 hidden xs:block">
          User: <span className="font-medium text-navy">{currentUser}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm shrink-0">
          {initials}
        </div>
      </div>
    </header>
  );
}
