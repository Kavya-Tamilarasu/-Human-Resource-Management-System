import React from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  BarChart3,
  ShieldCheck,
  UserCheck,
  FileText,
  HelpCircle,
  Building2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile
}) => {
  const { user } = useAuth();
  const isAdminOrHr = user?.role === 'admin' || user?.role === 'hr';

  const navItems = [
    {
      id: isAdminOrHr ? 'admin-dashboard' : 'dashboard',
      label: isAdminOrHr ? 'HR Command Center' : 'My Workspace',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['admin', 'hr', 'employee']
    },
    {
      id: 'attendance',
      label: isAdminOrHr ? 'Attendance & Logs' : 'Clock & Attendance',
      icon: <Clock className="w-4 h-4" />,
      roles: ['admin', 'hr', 'employee']
    },
    {
      id: 'leaves',
      label: isAdminOrHr ? 'Leave Approvals' : 'Time Off & Leaves',
      icon: <CalendarCheck className="w-4 h-4" />,
      roles: ['admin', 'hr', 'employee']
    },
    {
      id: 'payroll',
      label: isAdminOrHr ? 'Payroll Management' : 'My Salary & Payslips',
      icon: <CreditCard className="w-4 h-4" />,
      roles: ['admin', 'hr', 'employee']
    },
    {
      id: 'employees',
      label: isAdminOrHr ? 'Employee Directory' : 'Colleague Directory',
      icon: <Users className="w-4 h-4" />,
      roles: ['admin', 'hr', 'employee']
    },
    {
      id: 'profile',
      label: 'My Profile & Docs',
      icon: <UserCheck className="w-4 h-4" />,
      roles: ['employee', 'admin', 'hr']
    },
    {
      id: 'analytics',
      label: 'HR & Org Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ['admin', 'hr']
    },
    {
      id: 'audit',
      label: 'Audit & Compliance',
      icon: <ShieldCheck className="w-4 h-4" />,
      roles: ['admin', 'hr']
    }
  ];

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  const content = (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 py-6 px-4">
      <div className="space-y-6">
        {/* Workspace Brand / Tag with Geometric Diamond Logo */}
        <div className="px-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center mr-3 shrink-0 shadow-xs">
              <div className="w-4 h-4 border-2 border-white rotate-45" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white uppercase block leading-none">
                Dayflow
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 mt-1 block">
                {isAdminOrHr ? 'HR Enterprise' : 'Self-Service'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {isAdminOrHr ? 'Administration' : 'Self Service'}
          </div>

          {filteredNav.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div
                  className={`w-5 h-5 mr-3 rounded-xs flex items-center justify-center ${
                    isActive
                      ? 'bg-indigo-200 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.icon}
                </div>
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Geometric Profile Card in Sidebar */}
      {user && (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center border border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-slate-700 mr-3 overflow-hidden border border-slate-600 shrink-0">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate text-white">{user.name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
              {user.role === 'admin' ? 'Senior HR Admin' : user.role === 'hr' ? 'HR Specialist' : 'Staff Engineer'}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-20">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
