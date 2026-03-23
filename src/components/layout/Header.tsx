import { useStore } from '../../store/useStore';

export function Header() {
  const { currentUser } = useStore();
  
  const initials = currentUser.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
      <div className="font-semibold text-navy text-lg">
        Call Audit Management System
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-sm text-gray-600">
          User: <span className="font-medium text-navy">{currentUser}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm">
          {initials}
        </div>
      </div>
    </header>
  );
}
