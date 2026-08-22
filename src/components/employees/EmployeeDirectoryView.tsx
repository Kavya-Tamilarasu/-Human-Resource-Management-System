import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Briefcase,
  Edit,
  Eye,
  Shield,
  CreditCard,
  FileText,
  DollarSign,
  Grid,
  List
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Employee, SalaryStructure } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';

interface EmployeeDirectoryProps {
  initialOpenAddModal?: boolean;
}

export const EmployeeDirectoryView: React.FC<EmployeeDirectoryProps> = ({ initialOpenAddModal = false }) => {
  const { user, showToast } = useAuth();
  const isAdminOrHr = user?.role === 'admin' || user?.role === 'hr';

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Selected Employee Details Modal
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailTab, setDetailTab] = useState<'personal' | 'job' | 'salary' | 'docs'>('personal');

  // Add Employee Modal
  const [addModalOpen, setAddModalOpen] = useState(initialOpenAddModal);
  const [newEmpId, setNewEmpId] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'hr' | 'employee'>('employee');
  const [newDept, setNewDept] = useState('Engineering');
  const [newDesignation, setNewDesignation] = useState('Software Engineer');
  const [newEmploymentType, setNewEmploymentType] = useState('Full-time');
  const [newJoiningDate, setNewJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPhone, setNewPhone] = useState('+1 (555) 019-2834');
  const [newSalary, setNewSalary] = useState(7000);
  const [addingEmployee, setAddingEmployee] = useState(false);

  // Edit Employee Profile Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editEmergencyContact, setEditEmergencyContact] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedDept !== 'All') params.department = selectedDept;
      if (selectedType !== 'All') params.employmentType = selectedType;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await api.getEmployees(params);
      setEmployees(res.employees);
    } catch (err) {
      console.error('Failed to load employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [searchQuery, selectedDept, selectedType, selectedStatus]);

  useEffect(() => {
    if (initialOpenAddModal) setAddModalOpen(true);
  }, [initialOpenAddModal]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpId || !newName || !newEmail) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setAddingEmployee(true);
      const res = await api.createEmployee({
        employeeId: newEmpId,
        name: newName,
        email: newEmail,
        role: newRole,
        department: newDept,
        designation: newDesignation,
        employmentType: newEmploymentType,
        joiningDate: newJoiningDate,
        phone: newPhone,
        address: 'San Francisco, CA',
        salary: {
          basicSalary: Number(newSalary) * 0.6,
          baseSalary: Number(newSalary) * 0.6,
          hra: Number(newSalary) * 0.25,
          allowances: Number(newSalary) * 0.15,
          bonus: 0,
          deductions: Number(newSalary) * 0.08,
          taxDeduction: Number(newSalary) * 0.12,
          netSalary: Number(newSalary) * 0.8,
          bankAccount: 'US' + Math.floor(1000000000 + Math.random() * 9000000000)
        }
      });
      showToast('Employee profile created successfully', 'success');
      setAddModalOpen(false);
      // Reset form
      setNewEmpId('');
      setNewName('');
      setNewEmail('');
      await loadEmployees();
    } catch (err: any) {
      showToast(err.message || 'Failed to add employee', 'error');
    } finally {
      setAddingEmployee(false);
    }
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditEmployee(emp);
    setEditPhone(emp.phone || '');
    setEditAddress(emp.address || '');
    setEditEmergencyContact(emp.emergencyContact || '');
    setEditDesignation(emp.designation || '');
    setEditDepartment(emp.department || '');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmployee) return;

    try {
      setSavingEdit(true);
      const updatePayload: Partial<Employee> = {
        phone: editPhone,
        address: editAddress,
        emergencyContact: editEmergencyContact
      };

      if (isAdminOrHr) {
        updatePayload.designation = editDesignation;
        updatePayload.department = editDepartment;
      }

      const res = await api.updateEmployee(editEmployee.id, updatePayload);
      showToast('Employee profile updated successfully', 'success');
      setEditModalOpen(false);
      if (selectedEmployee?.id === editEmployee.id) {
        setSelectedEmployee(res);
      }
      await loadEmployees();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {isAdminOrHr ? 'Employee Management Directory' : 'Organization Directory'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isAdminOrHr
              ? 'Manage workforce profiles, employment records, department alignments, and salaries'
              : 'Browse colleagues across all departments and connect with team members'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View switcher */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {isAdminOrHr && (
            <button
              id="btn-open-add-employee"
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[240px] max-w-md flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, ID, or title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
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
          
          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>

          {/* Employment Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="All">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contractor">Contractor</option>
              <option value="Intern">Intern</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-medium">
          Showing <span className="font-bold text-slate-900 dark:text-white">{employees.length}</span> staff members
        </div>
      </div>

      {/* Employees Grid / Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Loading employee directory...</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Users className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No employees found</p>
          <p className="text-xs text-slate-400 mt-1">Try refining your search keyword or department filter</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {employees.map(emp => (
            <div
              key={emp.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-800 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={emp.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/20"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{emp.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{emp.designation}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      emp.role === 'admin'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : emp.role === 'hr'
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {emp.role.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{emp.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{emp.phone || '+1 (555) 019-2834'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-slate-400 font-bold">{emp.employeeId}</span>
                <div className="flex items-center gap-2">
                  {(isAdminOrHr || user?.employeeId === emp.employeeId) && (
                    <button
                      onClick={() => handleOpenEdit(emp)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedEmployee(emp)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-semibold text-xs transition"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Work Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{emp.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{emp.employeeId} • {emp.designation}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {emp.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{emp.department}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{emp.email}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{emp.phone}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{formatDate(emp.joiningDate)}</td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedEmployee(emp)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-xs transition"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comprehensive Profile Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
              <div className="flex items-center gap-4">
                <img
                  src={selectedEmployee.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={selectedEmployee.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedEmployee.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {selectedEmployee.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedEmployee.designation} • {selectedEmployee.department}
                  </p>
                  <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                    ID: {selectedEmployee.employeeId}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Profile Tabs */}
            <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 text-xs font-semibold">
              <button
                onClick={() => setDetailTab('personal')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  detailTab === 'personal'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Personal Info
              </button>
              <button
                onClick={() => setDetailTab('job')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  detailTab === 'job'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Employment & Job
              </button>
              {(isAdminOrHr || user?.employeeId === selectedEmployee.employeeId) && (
                <button
                  onClick={() => setDetailTab('salary')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    detailTab === 'salary'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Compensation Structure
                </button>
              )}
            </div>

            {/* Tab 1: Personal Info */}
            {detailTab === 'personal' && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Email Address</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedEmployee.email}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Phone Contact</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedEmployee.phone || '-'}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Home Address</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedEmployee.address || '-'}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Emergency Contact</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedEmployee.emergencyContact || '-'}</p>
                </div>
              </div>
            )}

            {/* Tab 2: Job Details */}
            {detailTab === 'job' && (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Department</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedEmployee.department}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Designation</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedEmployee.designation}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Employment Type</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedEmployee.employmentType || 'Full-time'}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Joining Date</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{formatDate(selectedEmployee.joiningDate)}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Reporting Manager</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedEmployee.managerName || 'Elena Vance'}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Work Location</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedEmployee.workLocation || 'San Francisco HQ'}</p>
                </div>
              </div>
            )}

            {/* Tab 3: Salary Breakdown */}
            {detailTab === 'salary' && selectedEmployee.salary && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-400 text-[10px] uppercase">Basic Monthly</span>
                    <p className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">{formatCurrency(selectedEmployee.salary.basicSalary)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-400 text-[10px] uppercase">HRA</span>
                    <p className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">{formatCurrency(selectedEmployee.salary.hra)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-400 text-[10px] uppercase">Special Allowances</span>
                    <p className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">{formatCurrency(selectedEmployee.salary.allowances)}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Net Monthly Take-Home</span>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">Direct Deposit ACH</p>
                  </div>
                  <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                    {formatCurrency(selectedEmployee.salary.netSalary)}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
              {(isAdminOrHr || user?.employeeId === selectedEmployee.employeeId) && (
                <button
                  onClick={() => {
                    handleOpenEdit(selectedEmployee);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Details
                </button>
              )}
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Employee Modal (Admin/HR) */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Add New Employee to Dayflow
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Provision profile, login credentials, and initial salary structure
            </p>

            <form onSubmit={handleAddEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP011"
                    value={newEmpId}
                    onChange={e => setNewEmpId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Role / Permissions</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="employee">Employee</option>
                    <option value="hr">HR Specialist</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="sarah.connor@dayflow.io"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={e => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Customer Operations">Customer Operations</option>
                    <option value="Security & Compliance">Security & Compliance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={newDesignation}
                    onChange={e => setNewDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={newJoiningDate}
                    onChange={e => setNewJoiningDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Gross Monthly Base ($)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={newSalary}
                    onChange={e => setNewSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingEmployee}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  {addingEmployee ? 'Creating Profile...' : 'Save & Onboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editModalOpen && editEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Edit Profile: {editEmployee.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Update personal contact information and employment fields
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Home Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={editEmergencyContact}
                  onChange={e => setEditEmergencyContact(e.target.value)}
                  placeholder="e.g. Spouse (+1 555-0199)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {isAdminOrHr && (
                <>
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                    <input
                      type="text"
                      value={editDesignation}
                      onChange={e => setEditDesignation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <select
                      value={editDepartment}
                      onChange={e => setEditDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
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

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
