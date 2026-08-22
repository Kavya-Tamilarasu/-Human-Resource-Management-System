import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Shield,
  Clock,
  Briefcase,
  Users,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../lib/api';

interface NavbarProps {
  onOpenNotifications: () => void;
  onNavigate: (tab: string) => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications, onNavigate, activeTab }) => {
  const { user, employee, logout, demoLogin } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [punchSummary, setPunchSummary] = useState<{ isCheckedIn: boolean; isCheckedOut: boolean } | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const notifs = await api.getNotifications();
        setUnreadCount(notifs.unreadCount);

        const summary = await api.getTodayAttendanceSummary();
        setPunchSummary({ isCheckedIn: summary.isCheckedIn, isCheckedOut: summary.isCheckedOut });
      } catch (err) {
        // silent fail
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const demoAccounts = [
    { id: 'EMP001', name: 'Elena Vance', role: 'admin', title: 'VP of HR (Admin/HR Master)', color: 'border-indigo-500' },
    { id: 'EMP002', name: 'Marcus Chen', role: 'employee', title: 'Staff Software Engineer', color: 'border-blue-500' },
    { id: 'EMP003', name: 'Priya Patel', role: 'employee', title: 'Lead Product Designer', color: 'border-pink-500' },
    { id: 'EMP006', name: 'Alex Rivera', role: 'hr', title: 'Engineering Manager (HR Privileges)', color: 'border-emerald-500' }
  ];

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header
      id="dayflow-main-header"
      className="sticky top-0 z-30 h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors"
    >
      {/* Left side info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center mr-3 shadow-xs">
            <div className="w-4 h-4 border-2 border-white rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-800 dark:text-white text-lg uppercase leading-none">
                Dayflow
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block font-medium">
              {todayDateString}
            </p>
          </div>
        </div>

        {/* Live Attendance Tag for Employee */}
        {user && punchSummary && (
          <div
            id="navbar-punch-badge"
            onClick={() => onNavigate('attendance')}
            className="cursor-pointer hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition ml-2 border border-slate-200/50 dark:border-slate-700/50"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Status:</span>
            {punchSummary.isCheckedIn ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Working (Checked In)
              </span>
            ) : punchSummary.isCheckedOut ? (
              <span className="text-blue-600 dark:text-blue-400 font-bold">Checked Out</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-bold">Not Clocked In</span>
            )}
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Geometric Toggle Pill (Real-time vs Historical indicator) */}
        <div className="hidden lg:flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button className="px-3.5 py-1 text-xs font-bold bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-2xs rounded-md">
            Real-time
          </button>
          <button className="px-3.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            Historical
          </button>
        </div>

        {/* Demo Switcher Quick Pill */}
        <div className="relative">
          <button
            id="btn-demo-account-switcher"
            onClick={() => setDemoMenuOpen(!demoMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800 rounded-lg transition"
            title="Switch demo persona"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Role Switcher</span>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
          </button>

          {demoMenuOpen && (
            <div
              id="demo-switcher-dropdown"
              className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Persona Switch</p>
              </div>
              <div className="py-1">
                {demoAccounts.map(demo => (
                  <button
                    key={demo.id}
                    onClick={() => {
                      demoLogin(demo.id);
                      setDemoMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition ${
                      user?.employeeId === demo.id ? 'bg-indigo-50/70 dark:bg-indigo-950/40' : ''
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                        {demo.name}
                        {user?.employeeId === demo.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{demo.title}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        demo.role === 'admin'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : demo.role === 'hr'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {demo.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <div className="relative">
          <button
            id="btn-theme-toggle"
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            aria-label="Toggle theme"
            className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
          >
            {resolvedTheme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>
          
          {themeMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => { setTheme('light'); setThemeMenuOpen(false); }}
                className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${theme === 'light' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                Light
                {theme === 'light' && <CheckCircle2 className="w-3 h-3" />}
              </button>
              <button
                onClick={() => { setTheme('dark'); setThemeMenuOpen(false); }}
                className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${theme === 'dark' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                Dark
                {theme === 'dark' && <CheckCircle2 className="w-3 h-3" />}
              </button>
              <button
                onClick={() => { setTheme('system'); setThemeMenuOpen(false); }}
                className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${theme === 'system' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
              >
                System
                {theme === 'system' && <CheckCircle2 className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>

        {/* Geometric Notification Bell Container */}
        <button
          id="btn-open-notifications"
          onClick={onOpenNotifications}
          aria-label="Notifications"
          className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition relative"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <div
              id="unread-notification-badge"
              className="w-2.5 h-2.5 bg-rose-500 rounded-full absolute top-2 right-2 border-2 border-white dark:border-slate-900"
            />
          )}
        </button>

        {/* User Dropdown */}
        {user && (
          <div className="relative">
            <button
              id="btn-user-profile-menu"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <img
                src={employee?.avatar || user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              />
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                  {user.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {userMenuOpen && (
              <div
                id="user-profile-dropdown"
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase">
                      {user.role}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{user.employeeId}</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    id="btn-nav-profile"
                    onClick={() => {
                      onNavigate('profile');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    My Profile
                  </button>
                  <button
                    id="btn-nav-attendance"
                    onClick={() => {
                      onNavigate('attendance');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Attendance Clock
                  </button>
                  <button
                    id="btn-nav-payroll"
                    onClick={() => {
                      onNavigate('payroll');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Payroll & Payslips
                  </button>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    id="btn-logout"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
