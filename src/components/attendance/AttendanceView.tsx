import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Filter,
  Download,
  Plus,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Search,
  User,
  Building,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { AttendanceRecord, Employee } from '../../types';
import { formatDate, formatTime, formatDuration } from '../../lib/utils';

export const AttendanceView: React.FC = () => {
  const { user, showToast } = useAuth();
  const isAdminOrHr = user?.role === 'admin' || user?.role === 'hr';

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [todaySummary, setTodaySummary] = useState<any>(null);
  const [punchLoading, setPunchLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filters
  const [selectedEmployee, setSelectedEmployee] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'weekly'>('list');

  // Manual Adjustment Modal (Admin/HR)
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualEmpId, setManualEmpId] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualCheckIn, setManualCheckIn] = useState('09:00:00');
  const [manualCheckOut, setManualCheckOut] = useState('17:30:00');
  const [manualStatus, setManualStatus] = useState('Present');
  const [manualNote, setManualNote] = useState('');
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedEmployee !== 'All') params.employeeId = selectedEmployee;
      if (selectedDepartment !== 'All') params.department = selectedDepartment;
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (selectedDate) params.date = selectedDate;

      const [attRes, summaryRes, empRes] = await Promise.all([
        api.getAttendance(params),
        api.getTodayAttendanceSummary(),
        isAdminOrHr ? api.getEmployees() : Promise.resolve({ total: 0, employees: [] })
      ]);

      setRecords(attRes.records);
      setTodaySummary(summaryRes);
      if (empRes.employees) setEmployees(empRes.employees);
    } catch (err) {
      console.error('Failed to load attendance records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedEmployee, selectedDepartment, selectedStatus, selectedDate]);

  const handleCheckIn = async () => {
    try {
      setPunchLoading(true);
      const res = await api.checkIn('San Francisco HQ', 'Web Attendance Clock');
      showToast(res.message, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Check-in failed', 'error');
    } finally {
      setPunchLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setPunchLoading(true);
      const res = await api.checkOut();
      showToast(res.message, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Check-out failed', 'error');
    } finally {
      setPunchLoading(false);
    }
  };

  const handleManualRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmpId || !manualDate) {
      showToast('Please select an employee and date', 'error');
      return;
    }

    try {
      setManualSubmitting(true);
      const res = await api.manualAttendanceRecord({
        employeeId: manualEmpId,
        date: manualDate,
        checkInTime: manualCheckIn,
        checkOutTime: manualCheckOut,
        status: manualStatus,
        note: manualNote
      });
      showToast(res.message, 'success');
      setManualModalOpen(false);
      setManualNote('');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save record', 'error');
    } finally {
      setManualSubmitting(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date,Employee ID,Employee Name,Department,Check-In,Check-Out,Duration,Status,Location'];
    const rows = records.map(r =>
      `"${r.date}","${r.employeeId}","${r.employeeName}","${r.department}","${r.checkInTime || '-'}","${r.checkOutTime || '-'}","${formatDuration(r.durationMinutes)}","${r.status}","${r.location || '-'}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dayflow_Attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance report exported as CSV.', 'success');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">Present</span>;
      case 'Half-day':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">Half-day</span>;
      case 'On Leave':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">On Leave</span>;
      case 'Absent':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">Absent</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Check-in Widget Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {isAdminOrHr ? 'Organization Attendance Tracker' : 'My Daily Attendance & Timesheets'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated punch clock, duration calculations, and historical records
          </p>
          <div className="mt-2 text-xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Check-In / Check-Out Controls for User */}
          <div className="flex items-center gap-2">
            {!todaySummary?.isCheckedIn && !todaySummary?.isCheckedOut && (
              <button
                id="btn-attendance-checkin"
                onClick={handleCheckIn}
                disabled={punchLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                Clock In Now
              </button>
            )}

            {todaySummary?.isCheckedIn && (
              <button
                id="btn-attendance-checkout"
                onClick={handleCheckOut}
                disabled={punchLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                Clock Out
              </button>
            )}

            {todaySummary?.isCheckedOut && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs border border-emerald-200 dark:border-emerald-800">
                ✓ Shift Completed ({formatDuration(todaySummary.userRecord?.durationMinutes)})
              </span>
            )}
          </div>

          {isAdminOrHr && (
            <>
              <button
                id="btn-manual-attendance"
                onClick={() => setManualModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Adjust / Log Record
              </button>

              <button
                id="btn-export-attendance-csv"
                onClick={exportToCSV}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {isAdminOrHr && (
            <>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={e => setSelectedEmployee(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="All">All Employees</option>
                  {employees.map(e => (
                    <option key={e.employeeId} value={e.employeeId}>{e.name} ({e.employeeId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={e => setSelectedDepartment(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Customer Operations">Customer Operations</option>
                  <option value="Security & Compliance">Security & Compliance</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Half-day">Half-day</option>
              <option value="On Leave">On Leave</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {(selectedEmployee !== 'All' || selectedDepartment !== 'All' || selectedStatus !== 'All' || selectedDate) && (
            <button
              onClick={() => {
                setSelectedEmployee('All');
                setSelectedDepartment('All');
                setSelectedStatus('All');
                setSelectedDate('');
              }}
              className="mt-4 px-2.5 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="text-slate-400 font-medium self-end">
          Showing <span className="font-bold text-slate-900 dark:text-white">{records.length}</span> records
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading attendance records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No attendance records found</p>
            <p className="text-xs text-slate-400 mt-1">Adjust filters or punch clock to create records</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Check In</th>
                  <th className="py-3.5 px-4">Check Out</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Location / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatDate(record.date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{record.employeeName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{record.employeeId} • {record.department}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {formatTime(record.checkInTime)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {formatTime(record.checkOutTime)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {formatDuration(record.durationMinutes)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                      {record.checkInNote || record.location || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Record Adjustment Modal (Admin/HR) */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Manual Attendance Adjustment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Add or modify an official employee attendance entry
            </p>

            <form onSubmit={handleManualRecordSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Select Employee</label>
                <select
                  required
                  value={manualEmpId}
                  onChange={e => setManualEmpId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(e => (
                    <option key={e.employeeId} value={e.employeeId}>{e.name} ({e.employeeId}) - {e.department}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={e => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={manualStatus}
                    onChange={e => setManualStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Present">Present</option>
                    <option value="Half-day">Half-day</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Check-In Time</label>
                  <input
                    type="time"
                    step="1"
                    value={manualCheckIn}
                    onChange={e => setManualCheckIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Check-Out Time</label>
                  <input
                    type="time"
                    step="1"
                    value={manualCheckOut}
                    onChange={e => setManualCheckOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">HR Note / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Approved remote work adjustment"
                  value={manualNote}
                  onChange={e => setManualNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  {manualSubmitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
