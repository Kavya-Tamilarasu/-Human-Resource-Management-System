import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  CreditCard,
  ShieldCheck,
  BarChart3,
  Users,
  CheckCircle2,
  Lock,
  Zap,
  Globe,
  Building,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenAuth }) => {
  const { demoLogin, user } = useAuth();

  const handleQuickDemo = async (empId: string) => {
    await demoLogin(empId);
    onEnterApp();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
              D
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">Dayflow</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 ml-2 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
                HRMS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                id="landing-btn-go-dashboard"
                onClick={onEnterApp}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                Launch App ({user.role})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  id="landing-btn-login"
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition"
                >
                  Sign In
                </button>
                <button
                  id="landing-btn-register"
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            OODO Hackathon Human Resource Management System
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            Every workday, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500">
              perfectly aligned.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A modern Human Resource Management System that simplifies employee management, attendance tracking, leave workflows, payroll visibility, and real-time workforce analytics.
          </p>

          {/* Action buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              id="hero-btn-admin-demo"
              onClick={() => handleQuickDemo('EMP001')}
              className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition flex items-center gap-2"
            >
              <span>Explore HR Admin View</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="hero-btn-employee-demo"
              onClick={() => handleQuickDemo('EMP002')}
              className="px-6 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <span>Explore Employee View</span>
            </button>
          </div>

          {/* Quick Demo Switcher Pill Bar */}
          <div className="mt-10 p-4 max-w-2xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-left">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Instant 1-Click Evaluation Personas</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold lowercase">live db connection</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickDemo('EMP001')}
                className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50 dark:bg-slate-800/40 text-left transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Elena Vance (HR Admin)</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Full HR Approvals & Payroll Run</div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-500" />
              </button>
              <button
                onClick={() => handleQuickDemo('EMP002')}
                className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50 dark:bg-slate-800/40 text-left transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Marcus Chen (Staff Engineer)</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Punch Clock, Apply Leave & Payslips</div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-500" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Modules Grid */}
      <section className="py-16 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Complete Enterprise HRMS Architecture
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Built strictly to satisfy every functional requirement of the OODO Hackathon specification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Attendance */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Real-Time Attendance & Stopwatch
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                One-click check-in/check-out with duplicate prevention, daily/weekly/monthly filters, working hour calculation, and geolocation tagging.
              </p>
            </div>

            {/* Feature 2: Leave Center */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Automated Leave Workflow
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Paid, Sick, Casual, and Unpaid leave applications. Real-time balance deductions, overlapping date prevention, and HR 1-click approvals with remarks.
              </p>
            </div>

            {/* Feature 3: Payroll */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Payroll & Itemized Payslips
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Base salary, HRA, bonuses, PF & tax deductions. Employee read-only payslips, admin salary structure updater, and monthly batch payouts.
              </p>
            </div>

            {/* Feature 4: Directory & Profiles */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Employee Management & Profiles
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Searchable directory with department filters. Permission-scoped self-service profile editing and full HR lifecycle administration.
              </p>
            </div>

            {/* Feature 5: Analytics */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Workforce & Financial Analytics
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Attendance rate metrics, department headcount distributions, salary budget allocations, and leave utilization charts.
              </p>
            </div>

            {/* Feature 6: Audit & Security */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                RBAC & Immutable Audit Logs
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Strict server-side role enforcement, password hashing, and complete audit trail for employee creation, salary changes, and approvals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Role Experience Comparison Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Employee Experience */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Employee Role
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-3">
                Seamless Employee Experience
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Designed to give employees full visibility and effortless interaction with daily HR workflows.
              </p>
              <ul className="space-y-3">
                {[
                  '1-Click Check-in / Check-out with working duration counter',
                  'Interactive Time Off center with real-time balance tracking',
                  'Read-only itemized salary breakdown and downloadable PDF payslips',
                  'Self-service personal contact, address, and profile updates',
                  'In-app alerts for leave approvals and monthly salary payouts'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleQuickDemo('EMP002')}
                className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
              >
                Test Employee Persona (Marcus Chen) →
              </button>
            </div>

            {/* HR / Admin Experience */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                HR / Admin Role
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-3">
                Executive HR Command Center
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Comprehensive oversight over workforce management, approvals, payroll, and compliance.
              </p>
              <ul className="space-y-3">
                {[
                  'Unified approval queue for pending time-off requests with remarks',
                  'Complete employee directory with full profile & salary edit rights',
                  'Automated monthly payroll generation and salary structure adjustments',
                  'Daily attendance roster and organization-wide trend metrics',
                  'Security audit trail logging all sensitive HR and compensation modifications'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleQuickDemo('EMP001')}
                className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition shadow-xs"
              >
                Test HR Admin Persona (Elena Vance) →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 Dayflow HRMS • OODO Hackathon Official Submission</p>
          <p className="mt-1 text-[11px] text-slate-400">Every workday, perfectly aligned.</p>
        </div>
      </footer>
    </div>
  );
};
