import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Calendar,
  CreditCard,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { formatDate, formatCurrency } from '../../lib/utils';

export const ProfileView: React.FC = () => {
  const { user, employee, refreshProfile, showToast } = useAuth();

  const [phone, setPhone] = useState(employee?.phone || '+1 (555) 019-2834');
  const [address, setAddress] = useState(employee?.address || '742 Evergreen Terrace, San Francisco, CA');
  const [emergencyContact, setEmergencyContact] = useState(employee?.emergencyContact || 'Alex (Spouse) - +1 555-0199');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    try {
      setSaving(true);
      await api.updateEmployee(employee.id, {
        phone,
        address,
        emergencyContact
      });
      showToast('Profile updated successfully', 'success');
      await refreshProfile();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={employee?.avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user?.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {user?.role.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {employee?.designation} • {employee?.department} • ID: {user?.employeeId}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 self-start md:self-auto">
          Member since {formatDate(employee?.joiningDate || '2022-06-01')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Edit Personal Contact Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Personal Contact & Details</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage your contact information and emergency contacts</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Email (Locked)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  required
                  value={emergencyContact}
                  onChange={e => setEmergencyContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : 'Save Contact Updates'}
                </button>
              </div>
            </form>
          </div>

          {/* Job & Org Info */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Official Employment Records</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Department</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{employee?.department}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Designation</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{employee?.designation}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Employment Type</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{employee?.employmentType || 'Full-time'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Reporting Manager</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{employee?.managerName || 'Elena Vance'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Work Location</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{employee?.workLocation || 'San Francisco HQ'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Date of Joining</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatDate(employee?.joiningDate || '2022-06-01')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security & Role */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <Shield className="w-4 h-4 text-indigo-500" />
              Role & Permissions
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Current System Role</span>
              <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm mt-0.5">
                {user?.role.toUpperCase()}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {user?.role === 'admin'
                  ? 'Full administrative control over all employees, approvals, and payroll.'
                  : user?.role === 'hr'
                  ? 'HR access for candidate onboarding, leave approvals, and employee records.'
                  : 'Standard self-service access for clocking attendance, leaves, and viewing payslips.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-semibold block mb-1">Direct Deposit Account</span>
              <p className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                {employee?.salary?.bankAccount || 'US8923481239'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
