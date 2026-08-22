import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { AuthView } from './components/auth/AuthView';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { AttendanceView } from './components/attendance/AttendanceView';
import { LeaveManagementView } from './components/leaves/LeaveManagementView';
import { PayrollView } from './components/payroll/PayrollView';
import { EmployeeDirectoryView } from './components/employees/EmployeeDirectoryView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { ProfileView } from './components/profile/ProfileView';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';

const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();

  // App navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);

  // Quick action triggers for child views
  const [openApplyLeaveModal, setOpenApplyLeaveModal] = useState<boolean>(false);
  const [openAddEmployeeModal, setOpenAddEmployeeModal] = useState<boolean>(false);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl animate-pulse">
            D
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Initializing Dayflow HRMS...
          </p>
        </div>
      </div>
    );
  }

  // If user opened auth modal/screen explicitly
  if (authMode) {
    return (
      <AuthView
        initialMode={authMode}
        onSuccess={() => setAuthMode(null)}
        onBackToLanding={() => {
          setAuthMode(null);
          setShowLanding(true);
        }}
      />
    );
  }

  // If user is not logged in or explicitly clicked "Overview"
  if (!user || showLanding) {
    return (
      <LandingPage
        onEnterApp={() => {
          setShowLanding(false);
          setActiveTab(user?.role === 'employee' ? 'dashboard' : 'admin-dashboard');
        }}
        onOpenAuth={(mode = 'login') => setAuthMode(mode)}
      />
    );
  }

  const isAdminOrHr = user.role === 'admin' || user.role === 'hr';

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setOpenApplyLeaveModal(false);
    setOpenAddEmployeeModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setMobileNavOpen(!mobileNavOpen)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onNavigate={handleNavigate}
        activeTab={activeTab}
        onOpenProfile={() => handleNavigate('profile')}
      />

      {/* Notification Drawer Overlay */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onSelectAction={handleNavigate}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleNavigate}
          isOpenMobile={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* Active View Router */}
          {activeTab === 'dashboard' && (
            <EmployeeDashboard
              onNavigate={handleNavigate}
              onApplyLeaveClick={() => {
                setActiveTab('leaves');
                setOpenApplyLeaveModal(true);
              }}
            />
          )}

          {activeTab === 'admin-dashboard' && (
            <AdminDashboard
              onNavigate={handleNavigate}
              onAddNewEmployeeClick={() => {
                setActiveTab('employees');
                setOpenAddEmployeeModal(true);
              }}
            />
          )}

          {activeTab === 'attendance' && <AttendanceView />}

          {activeTab === 'leaves' && (
            <LeaveManagementView initialOpenApplyModal={openApplyLeaveModal} />
          )}

          {activeTab === 'payroll' && <PayrollView />}

          {activeTab === 'employees' && (
            <EmployeeDirectoryView initialOpenAddModal={openAddEmployeeModal} />
          )}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'audit' && <AuditLogsView />}

          {activeTab === 'profile' && <ProfileView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
