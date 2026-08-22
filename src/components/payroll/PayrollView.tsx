import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Download,
  Printer,
  Edit,
  DollarSign,
  Plus,
  Building,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  FileText,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Payslip, Employee, SalaryStructure } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';

export const PayrollView: React.FC = () => {
  const { user, showToast } = useAuth();
  const isAdminOrHr = user?.role === 'admin' || user?.role === 'hr';

  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Payslip for Detailed Print/View Modal
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  // Edit Salary Modal (Admin/HR)
  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [targetEmployee, setTargetEmployee] = useState<Employee | null>(null);
  const [basic, setBasic] = useState<number>(0);
  const [hra, setHra] = useState<number>(0);
  const [allowances, setAllowances] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [bankAccount, setBankAccount] = useState('');
  const [pfNumber, setPfNumber] = useState('');
  const [savingSalary, setSavingSalary] = useState(false);

  // Batch Payroll Generation Modal
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchMonth, setBatchMonth] = useState('August 2026');
  const [batchYear, setBatchYear] = useState(2026);
  const [batchRunning, setBatchRunning] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = isAdminOrHr ? {} : { employeeId: user?.employeeId };
      const [payrollRes, empRes] = await Promise.all([
        api.getPayroll(params),
        isAdminOrHr ? api.getEmployees() : Promise.resolve({ total: 0, employees: [] })
      ]);

      setPayslips(payrollRes.payslips);
      if (empRes.employees) setEmployees(empRes.employees);
    } catch (err) {
      console.error('Failed to load payroll data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenSalaryEdit = (emp: Employee) => {
    setTargetEmployee(emp);
    const s = emp.salary || {
      basicSalary: 6000,
      baseSalary: 6000,
      hra: 2000,
      allowances: 1000,
      bonus: 500,
      deductions: 800,
      taxDeduction: 1200,
      netSalary: 7500,
      bankAccount: 'US8923481239',
      pfNumber: 'PF-992384'
    };
    setBasic(s.basicSalary || s.baseSalary || 6000);
    setHra(s.hra || 2000);
    setAllowances(s.allowances || 1000);
    setBonus(s.bonus || s.performanceBonus || 0);
    setDeductions(s.deductions || s.providentFund || 0);
    setTax(s.taxDeduction || 1200);
    setBankAccount(s.bankAccount || '');
    setPfNumber(s.pfNumber || s.panNumber || '');
    setSalaryModalOpen(true);
  };

  const calculatedNet = Math.max(0, basic + hra + allowances + bonus - deductions - tax);

  const handleSaveSalaryStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmployee) return;

    try {
      setSavingSalary(true);
      const res = await api.updateSalaryStructure(targetEmployee.id, {
        basicSalary: Number(basic),
        hra: Number(hra),
        allowances: Number(allowances),
        bonus: Number(bonus),
        deductions: Number(deductions),
        taxDeduction: Number(tax),
        netSalary: calculatedNet,
        bankAccount,
        pfNumber
      });
      showToast(res.message, 'success');
      setSalaryModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update salary structure', 'error');
    } finally {
      setSavingSalary(false);
    }
  };

  const handleRunBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBatchRunning(true);
      const res = await api.generatePayrollBatch(batchMonth, Number(batchYear));
      showToast(res.message, 'success');
      setBatchModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Batch generation failed', 'error');
    } finally {
      setBatchRunning(false);
    }
  };

  const handlePrintPayslip = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {isAdminOrHr ? 'Payroll Management & Salary Structures' : 'My Compensation & Payslips'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isAdminOrHr
              ? 'Configure salary components, generate monthly disbursement batches, and review compensation'
              : 'View your monthly payslips, itemized tax & deductions breakdown, and payment receipts'}
          </p>
        </div>

        {isAdminOrHr && (
          <div className="flex flex-wrap gap-2.5">
            <button
              id="btn-open-batch-payroll"
              onClick={() => setBatchModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Generate Monthly Batch
            </button>
          </div>
        )}
      </div>

      {/* Admin Salary Structures Configuration Table */}
      {isAdminOrHr && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Employee Compensation & Salary Structures</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Edit base pay, HRA, bonuses, PF, and tax deductions</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Basic Pay</th>
                  <th className="py-3 px-4">HRA & Allowances</th>
                  <th className="py-3 px-4">Deductions & Tax</th>
                  <th className="py-3 px-4">Net Monthly</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map(emp => {
                  const s = emp.salary || {
                    basicSalary: 6000,
                    hra: 2000,
                    allowances: 1000,
                    bonus: 0,
                    deductions: 800,
                    taxDeduction: 1200,
                    netSalary: 7000
                  };
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{emp.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{emp.employeeId} • {emp.designation}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {formatCurrency(s.basicSalary)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {formatCurrency((s.hra || 0) + (s.allowances || 0) + (s.bonus || 0))}
                      </td>
                      <td className="py-3 px-4 font-mono text-rose-600 dark:text-rose-400">
                        -{formatCurrency((s.deductions || 0) + (s.taxDeduction || 0))}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(s.netSalary)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenSalaryEdit(emp)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center gap-1 ml-auto"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Adjust Structure
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payslips Archive Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isAdminOrHr ? 'Disbursed Payslips Archive' : 'My Historical Payslips'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Itemized salary records with direct download and print receipts
            </p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">{payslips.length} payslips</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading payslips...</p>
          </div>
        ) : payslips.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CreditCard className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No payslips generated yet</p>
            <p className="text-xs text-slate-400 mt-1">Generate a monthly batch above to issue payslips</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Pay Period</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Gross Earnings</th>
                  <th className="py-3.5 px-4">Deductions</th>
                  <th className="py-3.5 px-4">Net Payout</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payslips.map(slip => (
                  <tr key={slip.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {slip.month}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{slip.employeeName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{slip.employeeId} • {slip.department}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(slip.grossSalary)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-rose-600 dark:text-rose-400">
                      -{formatCurrency(slip.totalDeductions)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(slip.netSalary)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {slip.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayslip(slip)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs transition flex items-center gap-1 ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Payslip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Itemized Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
          <div className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 animate-in zoom-in-95 duration-200 print:border-none print:shadow-none print:max-w-full">
            {/* Payslip Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">
                    D
                  </div>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">Dayflow Inc.</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  500 Howard Street, San Francisco, CA 94105 • support@dayflow.io
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] uppercase font-bold text-slate-400 block">OFFICIAL PAYSLIP</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">{selectedPayslip.month}</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-semibold">Status: Disbursed</span>
              </div>
            </div>

            {/* Employee Information */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs mb-6">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Employee Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedPayslip.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Employee ID</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedPayslip.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Department</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedPayslip.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Designation</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedPayslip.designation}</span>
              </div>
            </div>

            {/* Earnings & Deductions 2-Column Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-xs">
              {/* Earnings */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100 dark:border-slate-800">
                  Earnings & Allowances
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Basic Salary</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(selectedPayslip.basicSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">House Rent Allowance (HRA)</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(selectedPayslip.hra)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Special Allowances</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(selectedPayslip.allowances)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Performance Bonus</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(selectedPayslip.bonus)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold">
                  <span>Gross Earnings</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(selectedPayslip.grossSalary)}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100 dark:border-slate-800">
                  Taxes & Deductions
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Provident Fund (PF) / 401(k)</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(selectedPayslip.deductions)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Income Tax & TDS</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(selectedPayslip.taxDeduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Professional Tax</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">$0.00</span>
                </div>
                <div className="pt-7 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold">
                  <span>Total Deductions</span>
                  <span className="text-rose-600 dark:text-rose-400 font-mono">-{formatCurrency(selectedPayslip.totalDeductions)}</span>
                </div>
              </div>
            </div>

            {/* Net Salary Highlight */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between mb-6">
              <div>
                <span className="text-[11px] uppercase font-bold text-emerald-800 dark:text-emerald-300">Net Take-Home Pay</span>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">Deposited via Direct ACH</p>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                {formatCurrency(selectedPayslip.netSalary)}
              </div>
            </div>

            {/* Modal Actions (Hidden when printing) */}
            <div className="flex justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintPayslip}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Salary Structure Modal (Admin/HR) */}
      {salaryModalOpen && targetEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Adjust Salary Structure: {targetEmployee.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Update compensation breakdown and direct deposit settings
            </p>

            <form onSubmit={handleSaveSalaryStructure} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Basic Salary ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={basic}
                    onChange={e => setBasic(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">HRA ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={hra}
                    onChange={e => setHra(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Special Allowances ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={allowances}
                    onChange={e => setAllowances(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Monthly Bonus ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={bonus}
                    onChange={e => setBonus(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">PF / Deductions ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={deductions}
                    onChange={e => setDeductions(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">TDS / Tax Deduction ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={tax}
                    onChange={e => setTax(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Calculated Net Monthly:</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(calculatedNet)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Bank Account</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={e => setBankAccount(e.target.value)}
                    placeholder="US893248834"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">PF Identifier</label>
                  <input
                    type="text"
                    value={pfNumber}
                    onChange={e => setPfNumber(e.target.value)}
                    placeholder="PF-882348"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSalaryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSalary}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  {savingSalary ? 'Updating...' : 'Save Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Monthly Payroll Run Modal */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Generate Organization Payroll Batch
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Instantly calculate and issue payslips for all active employees
            </p>

            <form onSubmit={handleRunBatch} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Disbursement Month</label>
                <input
                  type="text"
                  required
                  value={batchMonth}
                  onChange={e => setBatchMonth(e.target.value)}
                  placeholder="e.g. August 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Fiscal Year</label>
                <input
                  type="number"
                  required
                  value={batchYear}
                  onChange={e => setBatchYear(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 text-xs">
                This will automatically calculate salaries for {employees.length} employees based on active salary structures and send notifications.
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={batchRunning}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {batchRunning ? 'Generating...' : 'Run Disbursement Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
