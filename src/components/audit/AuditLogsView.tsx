import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { api } from '../../lib/api';
import { AuditLog } from '../../types';
import { formatDate } from '../../lib/utils';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (actionFilter !== 'All') params.action = actionFilter;
      const res = await api.getAuditLogs(params);
      setLogs(res?.logs || []);
    } catch (err) {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const filteredLogs = (logs || []).filter(l => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const actor = (l.actorName || (l as any).performedByName || '').toLowerCase();
    const action = (l.action || '').toLowerCase();
    const entity = (l.targetEntity || '').toLowerCase();
    const details = typeof l.details === 'string' ? l.details.toLowerCase() : JSON.stringify(l.details || '').toLowerCase();
    return actor.includes(q) || action.includes(q) || entity.includes(q) || details.includes(q);
  });

  const getActionColor = (action: string = '') => {
    const act = (action || '').toUpperCase();
    if (act.includes('APPROVED')) return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
    if (act.includes('REJECTED') || act.includes('DELETE')) return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
    if (act.includes('UPDATE') || act.includes('SALARY')) return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
    return 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Compliance & Security Audit Trail
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable, server-recorded log of all administrative actions, salary modifications, and approvals
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Logs
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] max-w-md flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail by actor, action, or entity..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Actions</option>
              <option value="EMPLOYEE_CREATED">Employee Created</option>
              <option value="LEAVE_APPROVED">Leave Approved</option>
              <option value="LEAVE_REJECTED">Leave Rejected</option>
              <option value="SALARY_STRUCTURE_UPDATED">Salary Structure Updated</option>
              <option value="MANUAL_ATTENDANCE_RECORDED">Manual Attendance Logged</option>
              <option value="PAYROLL_BATCH_GENERATED">Payroll Batch Run</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-medium">
          Showing <span className="font-bold text-slate-900 dark:text-white">{filteredLogs.length}</span> audit events
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading audit trail...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No audit logs matching criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Details / Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map(log => {
                  const actorName = log.actorName || (log as any).performedByName || 'System';
                  const actorRole = log.actorRole || (log as any).performedByRole || 'Admin';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {actorName}
                        <span className="block text-[10px] text-slate-400 font-normal uppercase tracking-wider">
                          Role: {actorRole}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{log.targetEntity}</span>
                        {log.targetId && (
                          <span className="block text-[10px] text-slate-400 font-mono">ID: {log.targetId}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-md">
                        {typeof log.details === 'string' ? (
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{log.details}</p>
                        ) : (
                          <pre className="text-[11px] font-mono bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
