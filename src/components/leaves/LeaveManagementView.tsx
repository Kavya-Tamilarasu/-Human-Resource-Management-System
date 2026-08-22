import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CalendarPlus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  User,
  ChevronRight,
  Sparkles,
  Info,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { LeaveBalance, LeaveRequest, Employee } from '../../types';
import { formatDate } from '../../lib/utils';

interface LeaveManagementViewProps {
  initialOpenApplyModal?: boolean;
}

export const LeaveManagementView: React.FC<LeaveManagementViewProps> = ({ initialOpenApplyModal = false }) => {
  const { user, showToast } = useAuth();
  const isAdminOrHr = user?.role === 'admin' || user?.role === 'hr';

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);

  // Apply Leave Modal
  const [applyModalOpen, setApplyModalOpen] = useState(initialOpenApplyModal);
  const [leaveType, setLeaveType] = useState('Paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Review Modal (Admin/HR)
  const [reviewModalLeave, setReviewModalLeave] = useState<LeaveRequest | null>(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== 'All') params.status = filterStatus;
      if (filterType !== 'All') params.leaveType = filterType;

      const [leavesRes, balanceRes] = await Promise.all([
        api.getLeaves(params),
        user ? api.getLeaveBalance(user.employeeId) : Promise.resolve(null)
      ]);

      setLeaves(leavesRes.leaves);
      if (balanceRes) setBalance(balanceRes);
    } catch (err) {
      console.error('Failed to load leave records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus, filterType, user]);

  useEffect(() => {
    if (initialOpenApplyModal) setApplyModalOpen(true);
  }, [initialOpenApplyModal]);

  // Calculate business days in selection
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;

    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      showToast('End date cannot be earlier than start date', 'error');
      return;
    }

    const days = calculateDays();
    if (days === 0) {
      showToast('Selected date range contains no business days', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.applyLeave({
        leaveType,
        startDate,
        endDate,
        reason
      });
      showToast(res.message, 'success');
      setApplyModalOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit leave', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (status: 'Approved' | 'Rejected') => {
    if (!reviewModalLeave) return;
    try {
      setReviewLoading(true);
      const res = await api.reviewLeave(reviewModalLeave.id, status, adminRemarks);
      showToast(res.message, 'success');
      setReviewModalLeave(null);
      setAdminRemarks('');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Review failed', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {isAdminOrHr ? 'Leave Approval & Time Off Center' : 'Time Off & Leave Management'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isAdminOrHr
              ? 'Review pending time-off requests, manage balances, and track organization leaves'
              : 'Submit leave applications, track real-time approval status, and check annual balances'}
          </p>
        </div>

        <button
          id="btn-open-apply-leave"
          onClick={() => setApplyModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5 self-start md:self-auto"
        >
          <CalendarPlus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* Leave Balances Grid */}
      {balance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
              <span>Paid Annual Leave</span>
              <CalendarCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {balance.paidTotal - balance.paidUsed}{' '}
              <span className="text-xs font-normal text-slate-400">/ {balance.paidTotal} days</span>
            </div>
            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${((balance.paidTotal - balance.paidUsed) / balance.paidTotal) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
              <span>Sick Leave</span>
              <Calendar className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {balance.sickTotal - balance.sickUsed}{' '}
              <span className="text-xs font-normal text-slate-400">/ {balance.sickTotal} days</span>
            </div>
            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${((balance.sickTotal - balance.sickUsed) / balance.sickTotal) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
              <span>Casual Leave</span>
              <Calendar className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {balance.casualTotal - balance.casualUsed}{' '}
              <span className="text-xs font-normal text-slate-400">/ {balance.casualTotal} days</span>
            </div>
            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full"
                style={{ width: `${((balance.casualTotal - balance.casualUsed) / balance.casualTotal) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
              <span>Unpaid Leave Taken</span>
              <Info className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {balance.unpaidUsed} <span className="text-xs font-normal text-slate-400">days</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400">Deducted from monthly payroll if applicable</div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Leave Type</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Types</option>
              <option value="Paid">Paid Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Casual">Casual Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-medium self-end">
          Showing <span className="font-bold text-slate-900 dark:text-white">{leaves.length}</span> requests
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading leave requests...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No leave requests found</p>
            <p className="text-xs text-slate-400 mt-1">Submit a new request or adjust filter criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Date Range</th>
                  <th className="py-3.5 px-4">Days</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaves.map(leave => (
                  <tr key={leave.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{leave.employeeName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{leave.employeeId} • {leave.department}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {leave.leaveType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {leave.daysCount} d
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs">
                      <div className="truncate">{leave.reason}</div>
                      {leave.adminRemarks && (
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 italic mt-0.5">
                          HR Note: "{leave.adminRemarks}"
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          leave.status === 'Approved'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : leave.status === 'Rejected'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isAdminOrHr && leave.status === 'Pending' ? (
                        <button
                          onClick={() => setReviewModalLeave(leave)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          {leave.reviewedBy ? `Reviewed` : 'Submitted'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Apply for Leave / Time Off
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Submit your dates for manager and HR approval
            </p>

            <form onSubmit={handleApplySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Paid">Paid Annual Leave (Vacation)</option>
                  <option value="Sick">Sick Leave (Medical)</option>
                  <option value="Casual">Casual Personal Time</option>
                  <option value="Unpaid">Unpaid Leave</option>
                  <option value="Paternity">Paternity Leave</option>
                  <option value="Maternity">Maternity Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {startDate && endDate && (
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-semibold flex items-center justify-between">
                  <span>Calculated Business Days:</span>
                  <span className="text-sm font-bold">{calculateDays()} day(s)</span>
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Reason / Purpose</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Attending family wedding / Doctor appointment"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  {submitting ? 'Submitting...' : 'Submit Leave Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal (Admin/HR) */}
      {reviewModalLeave && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Review Leave Request
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Make approval decision for {reviewModalLeave.employeeName}
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Employee:</span>
                <span className="font-bold text-slate-900 dark:text-white">{reviewModalLeave.employeeName} ({reviewModalLeave.employeeId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{reviewModalLeave.leaveType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dates:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatDate(reviewModalLeave.startDate)} to {formatDate(reviewModalLeave.endDate)} ({reviewModalLeave.daysCount} days)
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-0.5">Reason:</span>
                <p className="italic text-slate-700 dark:text-slate-300">"{reviewModalLeave.reason}"</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admin Comments / Notes (Optional)
              </label>
              <textarea
                value={adminRemarks}
                onChange={e => setAdminRemarks(e.target.value)}
                placeholder="e.g. Approved. Have a great vacation!"
                rows={2}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setReviewModalLeave(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reviewLoading}
                onClick={() => handleReview('Rejected')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition"
              >
                Reject Request
              </button>
              <button
                type="button"
                disabled={reviewLoading}
                onClick={() => handleReview('Approved')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
              >
                Approve Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
