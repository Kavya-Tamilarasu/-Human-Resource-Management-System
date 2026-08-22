import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  UserPlus,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Building,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { AnalyticsSummary, LeaveRequest } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
  onAddNewEmployeeClick: () => void;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onAddNewEmployeeClick }) => {
  const { user, showToast } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalLeave, setReviewModalLeave] = useState<LeaveRequest | null>(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, leavesData] = await Promise.all([
        api.getAnalytics(),
        api.getLeaves({ status: 'Pending' })
      ]);
      setAnalytics(analyticsData);
      setPendingLeaves(leavesData.leaves);
    } catch (err) {
      console.error('Failed to load admin analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewLeave = async (status: 'Approved' | 'Rejected') => {
    if (!reviewModalLeave) return;
    try {
      setReviewLoading(true);
      const res = await api.reviewLeave(reviewModalLeave.id, status, adminRemarks);
      showToast(res.message, 'success');
      setReviewModalLeave(null);
      setAdminRemarks('');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleRunPayrollBatch = async () => {
    try {
      const res = await api.generatePayrollBatch('August 2026', 2026);
      showToast(res.message, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Payroll run failed', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            Executive HR Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Workforce Overview & Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Logged in as {user?.name} ({user?.role.toUpperCase()}) • Organization Active Sync
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            id="btn-admin-add-emp"
            onClick={onAddNewEmployeeClick}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Employee
          </button>
          <button
            id="btn-admin-run-payroll"
            onClick={handleRunPayrollBatch}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Run Payroll Batch
          </button>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Workforce */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Total Employees
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white">
            {analytics?.totalEmployees || 10}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              100% Active
            </span>
            <span className="text-xs text-slate-400 font-medium">Headcount</span>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-full rounded-full" />
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Present Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white">
            {analytics?.presentToday ?? 8}
            <span className="text-xs font-normal text-slate-400 ml-1.5">/ {analytics?.totalEmployees || 10}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {analytics?.attendanceRate || 90}% Rate
            </span>
            <span className="text-xs text-slate-400 font-medium">Daily Target</span>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[90%] rounded-full" />
          </div>
        </div>

        {/* Pending Leaves */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Pending Leaves
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white">
            {pendingLeaves.length}
            <span className="text-xs font-normal text-slate-400 ml-1.5">queue</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {pendingLeaves.length > 0 ? 'Action Needed' : 'Queue Clear'}
            </span>
            <span className="text-xs text-slate-400 font-medium">Pending Decision</span>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 w-[35%] rounded-full" />
          </div>
        </div>

        {/* Monthly Payroll Total */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Monthly Payroll
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white">
            {analytics?.monthlyPayrollTotal ? formatCurrency(analytics.monthlyPayrollTotal) : '$142,440'}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Direct Deposit
            </span>
            <span className="text-xs text-slate-400 font-medium">Disbursed</span>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 w-[85%] rounded-full" />
          </div>
        </div>
      </div>

      {/* Pending Leave Approvals Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Pending Leave Approvals</span>
              {pendingLeaves.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  {pendingLeaves.length} Action Needed
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review and decision employee time-off requests
            </p>
          </div>
          <button
            onClick={() => onNavigate('leaves')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Open leave center →
          </button>
        </div>

        {pendingLeaves.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
              All leave requests have been reviewed
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Dates</th>
                  <th className="pb-3">Days</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingLeaves.map(leave => (
                  <tr key={leave.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {leave.employeeName}
                      <span className="block text-[10px] text-slate-400 font-mono">{leave.employeeId} • {leave.department}</span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px]">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                    </td>
                    <td className="py-3 font-bold text-slate-800 dark:text-slate-200">
                      {leave.daysCount} d
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {leave.reason}
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => setReviewModalLeave(leave)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
                      >
                        Review Request
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Attendance Activity Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily attendance breakdown across past dates</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {analytics?.attendanceTrends && analytics.attendanceTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.attendanceTrends}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="present" name="Present" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="halfDay" name="Half-day" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="onLeave" name="On Leave" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="absent" name="Absent" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart data...</div>
            )}
          </div>
        </div>

        {/* Department Workforce & Budget Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Department Headcount & Payroll</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Staff distribution by functional team</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {analytics?.departmentBreakdown && analytics.departmentBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.departmentBreakdown}>
                  <XAxis dataKey="department" stroke="#94a3b8" fontSize={10} tickFormatter={val => val.split(' ')[0]} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      name === 'budget' ? formatCurrency(Number(value)) : `${value} employees`,
                      name === 'budget' ? 'Payroll Budget' : 'Headcount'
                    ]}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="count" name="Headcount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading department data...</div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalLeave && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Review Leave Request
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Decide on employee time-off application
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Employee:</span>
                <span className="font-bold text-slate-900 dark:text-white">{reviewModalLeave.employeeName} ({reviewModalLeave.employeeId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Leave Type:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{reviewModalLeave.leaveType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Duration:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatDate(reviewModalLeave.startDate)} to {formatDate(reviewModalLeave.endDate)} ({reviewModalLeave.daysCount} days)
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Reason:</span>
                <p className="italic text-slate-700 dark:text-slate-300">"{reviewModalLeave.reason}"</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                HR Remarks / Decision Notes (Optional)
              </label>
              <textarea
                value={adminRemarks}
                onChange={e => setAdminRemarks(e.target.value)}
                placeholder="e.g. Approved. Please ensure handoff to team."
                rows={2}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setReviewModalLeave(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewLoading}
                onClick={() => handleReviewLeave('Rejected')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>
              <button
                type="button"
                disabled={reviewLoading}
                onClick={() => handleReviewLeave('Approved')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
