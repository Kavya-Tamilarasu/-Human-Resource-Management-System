import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CreditCard,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Sparkles,
  MapPin,
  CalendarCheck,
  FileText,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { AttendanceRecord, LeaveBalance, LeaveRequest, Payslip } from '../../types';
import { formatCurrency, formatDate, formatTime, formatDuration } from '../../lib/utils';

interface EmployeeDashboardProps {
  onNavigate: (tab: string) => void;
  onApplyLeaveClick: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onNavigate, onApplyLeaveClick }) => {
  const { user, employee, showToast } = useAuth();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [todaySummary, setTodaySummary] = useState<{
    userRecord: AttendanceRecord | null;
    isCheckedIn: boolean;
    isCheckedOut: boolean;
  } | null>(null);

  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [latestPayslip, setLatestPayslip] = useState<Payslip | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Live clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      const summary = await api.getTodayAttendanceSummary();
      setTodaySummary({
        userRecord: summary.userRecord,
        isCheckedIn: summary.isCheckedIn,
        isCheckedOut: summary.isCheckedOut
      });

      const balance = await api.getLeaveBalance(user.employeeId);
      setLeaveBalance(balance);

      const leavesRes = await api.getLeaves({ employeeId: user.employeeId });
      setRecentLeaves(leavesRes.leaves.slice(0, 3));

      const payrollRes = await api.getPayroll({ employeeId: user.employeeId });
      if (payrollRes.payslips.length > 0) {
        setLatestPayslip(payrollRes.payslips[0]);
      }
    } catch (err) {
      console.error('Failed to load employee dashboard data', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      const res = await api.checkIn('San Francisco HQ (Floor 4)', 'Web Punch Clock');
      showToast(res.message, 'success');
      await loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Check-in failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      const res = await api.checkOut();
      showToast(res.message, 'success');
      await loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Check-out failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 backdrop-blur-md text-indigo-200 border border-white/10 mb-2">
              <Sparkles className="w-3 h-3 text-indigo-300" />
              Employee Self-Service Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.name.split(' ')[0]} 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl">
              {employee?.designation} • {employee?.department} • ID: {user?.employeeId}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button
              id="emp-quick-apply-leave"
              onClick={onApplyLeaveClick}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-900 dark:text-indigo-100 hover:bg-indigo-50 dark:hover:bg-slate-700 transition shadow-xs flex items-center gap-1.5 border border-transparent dark:border-slate-700"
            >
              <Calendar className="w-3.5 h-3.5" />
              Apply Leave
            </button>
            <button
              id="emp-quick-view-payslips"
              onClick={() => onNavigate('payroll')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5" />
              My Payslips
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Metric & Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Live Attendance Punch Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Attendance Clock
              </span>
              <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            <div className="my-2">
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {todaySummary?.isCheckedIn
                  ? 'Working (Checked In)'
                  : todaySummary?.isCheckedOut
                  ? 'Day Completed'
                  : 'Not Clocked In'}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {todaySummary?.userRecord?.checkInTime ? `Punched at ${formatTime(todaySummary.userRecord.checkInTime)}` : 'Ready to record today\'s shift'}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            {!todaySummary?.isCheckedIn && !todaySummary?.isCheckedOut && (
              <button
                id="btn-emp-check-in"
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                Check In Now
              </button>
            )}

            {todaySummary?.isCheckedIn && (
              <button
                id="btn-emp-check-out"
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                Check Out
              </button>
            )}

            {todaySummary?.isCheckedOut && (
              <div className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs text-center">
                Completed ({formatDuration(todaySummary.userRecord?.durationMinutes)})
              </div>
            )}
          </div>
        </div>

        {/* 2. Paid Leave Balance */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Paid Leave Balance
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">
              {leaveBalance ? leaveBalance.paidTotal - leaveBalance.paidUsed : 20}
              <span className="text-xs font-normal text-slate-400 ml-1.5">days</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {leaveBalance?.paidUsed || 0} days taken
              </span>
              <span className="text-xs text-slate-400 font-medium">of {leaveBalance?.paidTotal || 24}</span>
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  (((leaveBalance?.paidTotal || 24) - (leaveBalance?.paidUsed || 0)) / (leaveBalance?.paidTotal || 24)) * 100
                )}%`
              }}
            />
          </div>
        </div>

        {/* 3. Sick & Casual Balance */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Sick & Casual Leave
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">
              {leaveBalance ? leaveBalance.sickTotal - leaveBalance.sickUsed : 12}
              <span className="text-xs font-normal text-slate-400 ml-1.5">sick days</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {leaveBalance ? leaveBalance.casualTotal - leaveBalance.casualUsed : 6} Casual left
              </span>
              <span className="text-xs text-slate-400 font-medium">Available</span>
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 w-[70%] rounded-full" />
          </div>
        </div>

        {/* 4. Net Salary Preview */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Monthly Net Salary
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">
              {employee?.salary?.netSalary ? formatCurrency(employee.salary.netSalary) : '$0'}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Direct Deposit
              </span>
              <span className="text-xs text-slate-400 font-medium">{employee?.salary?.bankAccount || '•••• 8823'}</span>
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-[80%] rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Content Sections: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Leave Requests & Time Off (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leave Requests Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">My Recent Leave Requests</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Real-time status updates from HR</p>
              </div>
              <button
                onClick={() => onNavigate('leaves')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all
              </button>
            </div>

            {recentLeaves.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-xs">No active leave requests</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentLeaves.map(leave => (
                  <div key={leave.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {leave.leaveType} Leave ({leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'})
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            leave.status === 'Approved'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : leave.status === 'Rejected'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {leave.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatDate(leave.startDate)} to {formatDate(leave.endDate)} • Reason: {leave.reason}
                      </div>
                      {leave.adminRemarks && (
                        <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 italic">
                          HR Note: "{leave.adminRemarks}"
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      Applied {formatDate(leave.appliedAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Job & Organization Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Job & Employment Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-400">Department</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{employee?.department || 'Engineering'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-400">Designation</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{employee?.designation || 'Staff Engineer'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-400">Employment Type</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{employee?.employmentType || 'Full-time'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-400">Reporting Manager</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{employee?.managerName || 'Elena Vance'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile & Company Notices (1 col) */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center">
            <img
              src={employee?.avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-cover mx-auto ring-2 ring-indigo-500/30 mb-3"
            />
            <h4 className="font-bold text-slate-900 dark:text-white text-base">{user?.name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{employee?.designation}</p>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Employee ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{user?.employeeId}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Work Email:</span>
                <span className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]">{user?.email}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Joined:</span>
                <span className="font-medium text-slate-900 dark:text-white">{formatDate(employee?.joiningDate || '2022-06-01')}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('profile')}
              className="mt-5 w-full py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
            >
              Edit Contact & Profile
            </button>
          </div>

          {/* Quick Notice Board */}
          <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-indigo-900 dark:text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Company Bulletin
            </div>
            <p className="text-xs text-indigo-900/80 dark:text-indigo-200 leading-relaxed">
              Quarterly All-Hands scheduled for Friday at 3:00 PM PST. Please submit pending leave requests for next month by the 25th.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
