export type Role = 'admin' | 'hr' | 'employee';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  avatar?: string;
  createdAt: string;
}

export interface SalaryStructure {
  baseSalary?: number;
  basicSalary?: number;
  hra: number; // Housing Rent Allowance
  allowances: number; // Other allowances (conveyance, medical, etc.)
  performanceBonus?: number;
  bonus?: number;
  taxDeduction: number;
  providentFund?: number;
  deductions?: number;
  netSalary: number;
  currency?: string;
  paymentFrequency?: 'Monthly' | 'Bi-weekly';
  bankAccount?: string;
  panNumber?: string;
  pfNumber?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'ID' | 'Contract' | 'Resume' | 'Certificate' | 'Tax';
  uploadDate: string;
  fileUrl?: string;
  fileSize?: string;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone: string;
  address: string;
  department: string;
  designation: string;
  joiningDate: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  managerName: string;
  status: 'Active' | 'On Leave' | 'Terminated' | 'Probation';
  salary: SalaryStructure;
  documents: DocumentItem[];
  emergencyContact?: EmergencyContact;
  dob?: string;
  gender?: string;
  skills?: string[];
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Half-day' | 'On Leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:mm:ss
  checkOutTime?: string; // HH:mm:ss
  durationMinutes?: number;
  status: AttendanceStatus;
  checkInNote?: string;
  ipAddress?: string;
  location?: string;
}

export type LeaveType = 'Paid' | 'Sick' | 'Unpaid' | 'Casual' | 'Paternity' | 'Maternity';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminRemarks?: string;
}

export interface LeaveBalance {
  employeeId: string;
  paidTotal: number;
  paidUsed: number;
  sickTotal: number;
  sickUsed: number;
  casualTotal: number;
  casualUsed: number;
  unpaidUsed: number;
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  month: string;
  year: number;
  baseSalary: number;
  hra: number;
  allowances: number;
  bonuses: number;
  taxDeductions: number;
  pfDeductions: number;
  netPay: number;
  status: 'Paid' | 'Pending' | 'Processing';
  paymentDate?: string;
  transactionId?: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'leave' | 'attendance' | 'payroll';

export interface AppNotification {
  id: string;
  recipientEmployeeId?: string; // empty means broadcast or role-targeted
  roleTarget?: Role;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  timestamp: string;
  link?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  targetEntity: 'Employee' | 'Attendance' | 'Leave' | 'Payroll' | 'Auth' | 'Document' | 'System';
  targetId: string;
  details: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AnalyticsSummary {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  attendanceRate: number;
  pendingLeaves: number;
  monthlyPayrollTotal: number;
  departmentBreakdown: { department: string; count: number; budget: number }[];
  attendanceTrends: { date: string; present: number; absent: number; halfDay: number; onLeave: number }[];
  leaveUtilization: { type: string; count: number; percentage: number }[];
  genderBreakdown: { name: string; value: number }[];
}
