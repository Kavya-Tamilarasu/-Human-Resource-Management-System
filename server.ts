import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Persistence & Database Layer ---
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing utility using native crypto PBKDF2
function hashPassword(password: string, salt: string = 'dayflow_salt_2026'): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

interface DBState {
  users: Array<{
    id: string;
    employeeId: string;
    name: string;
    email: string;
    passwordHash: string;
    role: 'admin' | 'hr' | 'employee';
    isEmailVerified: boolean;
    createdAt: string;
  }>;
  employees: Array<any>;
  attendance: Array<any>;
  leaveRequests: Array<any>;
  leaveBalances: Record<string, any>;
  payslips: Array<any>;
  notifications: Array<any>;
  auditLogs: Array<any>;
  sessions: Record<string, { userId: string; role: string; employeeId: string; expiresAt: number }>;
}

let db: DBState = {
  users: [],
  employees: [],
  attendance: [],
  leaveRequests: [],
  leaveBalances: {},
  payslips: [],
  notifications: [],
  auditLogs: [],
  sessions: {}
};

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}

function loadDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
      if (!db.sessions) db.sessions = {};
      return;
    } catch (e) {
      console.warn('Could not read db.json, generating default seed data...');
    }
  }
  seedDatabase();
}

function seedDatabase() {
  const defaultPasswordHash = hashPassword('Password123!');

  const initialEmployees = [
    {
      id: 'emp_001',
      employeeId: 'EMP001',
      name: 'Elena Vance',
      email: 'elena.vance@dayflow.io',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, Suite 400, San Francisco, CA 94107',
      department: 'Human Resources',
      designation: 'VP of People & Culture',
      joiningDate: '2022-01-15',
      employmentType: 'Full-time',
      managerName: 'Board of Directors',
      status: 'Active',
      dob: '1988-04-12',
      gender: 'Female',
      skills: ['Strategic HR', 'Talent Acquisition', 'Compensation & Benefits', 'Conflict Resolution', 'Labor Law'],
      emergencyContact: { name: 'Arthur Vance', relation: 'Spouse', phone: '+1 (555) 987-6543' },
      salary: {
        baseSalary: 14500,
        hra: 3500,
        allowances: 2000,
        performanceBonus: 1500,
        taxDeduction: 3200,
        providentFund: 800,
        netSalary: 17500,
        currency: 'USD',
        paymentFrequency: 'Monthly',
        bankAccount: '•••• •••• •••• 4491',
        panNumber: 'USA-HR-9821'
      },
      documents: [
        { id: 'doc_1', title: 'Employment Agreement', category: 'Contract', uploadDate: '2022-01-15', fileSize: '2.4 MB' },
        { id: 'doc_2', title: 'HR Leadership Certification', category: 'Certificate', uploadDate: '2023-05-10', fileSize: '1.1 MB' }
      ]
    },
    {
      id: 'emp_002',
      employeeId: 'EMP002',
      name: 'Marcus Chen',
      email: 'marcus.chen@dayflow.io',
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 345-6789',
      address: '1204 Market Street, Apt 5B, San Francisco, CA 94103',
      department: 'Engineering',
      designation: 'Staff Software Engineer',
      joiningDate: '2022-06-01',
      employmentType: 'Full-time',
      managerName: 'Alex Rivera',
      status: 'Active',
      dob: '1992-08-24',
      gender: 'Male',
      skills: ['TypeScript', 'Distributed Systems', 'Node.js', 'PostgreSQL', 'Kubernetes'],
      emergencyContact: { name: 'Mei Chen', relation: 'Mother', phone: '+1 (555) 432-1098' },
      salary: {
        baseSalary: 13000,
        hra: 3000,
        allowances: 1500,
        performanceBonus: 1200,
        taxDeduction: 2800,
        providentFund: 700,
        netSalary: 15200,
        currency: 'USD',
        paymentFrequency: 'Monthly',
        bankAccount: '•••• •••• •••• 8823',
        panNumber: 'USA-ENG-3390'
      },
      documents: [
        { id: 'doc_3', title: 'Senior Engineer Offer Letter', category: 'Contract', uploadDate: '2022-06-01', fileSize: '1.8 MB' },
        { id: 'doc_4', title: 'Cloud Solutions Architect Badge', category: 'Certificate', uploadDate: '2023-09-12', fileSize: '850 KB' }
      ]
    },
    {
      id: 'emp_003',
      employeeId: 'EMP003',
      name: 'Priya Patel',
      email: 'priya.patel@dayflow.io',
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 456-7890',
      address: '388 Beale St, San Francisco, CA 94105',
      department: 'Product & Design',
      designation: 'Lead Product Designer',
      joiningDate: '2023-02-15',
      employmentType: 'Full-time',
      managerName: 'Elena Vance',
      status: 'Active',
      dob: '1994-11-19',
      gender: 'Female',
      skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Accessibility'],
      emergencyContact: { name: 'Rohan Patel', relation: 'Brother', phone: '+1 (555) 876-5432' },
      salary: {
        baseSalary: 11500,
        hra: 2800,
        allowances: 1200,
        performanceBonus: 1000,
        taxDeduction: 2400,
        providentFund: 600,
        netSalary: 13500,
        currency: 'USD',
        paymentFrequency: 'Monthly',
        bankAccount: '•••• •••• •••• 1049',
        panNumber: 'USA-DES-7721'
      },
      documents: [
        { id: 'doc_5', title: 'Lead Designer Contract', category: 'Contract', uploadDate: '2023-02-15', fileSize: '2.1 MB' }
      ]
    },
    {
      id: 'emp_004',
      employeeId: 'EMP004',
      name: 'Liam Sullivan',
      email: 'liam.sullivan@dayflow.io',
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 567-8901',
      address: '55 9th St, San Francisco, CA 94103',
      department: 'Marketing',
      designation: 'Growth Marketing Lead',
      joiningDate: '2023-04-10',
      employmentType: 'Full-time',
      managerName: 'Elena Vance',
      status: 'Active',
      dob: '1991-03-05',
      gender: 'Male',
      skills: ['Demand Gen', 'SEO/SEM', 'Product Marketing', 'Google Analytics 4', 'HubSpot'],
      emergencyContact: { name: 'Clara Sullivan', relation: 'Spouse', phone: '+1 (555) 654-3210' },
      salary: {
        baseSalary: 10500,
        hra: 2500,
        allowances: 1000,
        performanceBonus: 1500,
        taxDeduction: 2200,
        providentFund: 550,
        netSalary: 12750,
        currency: 'USD',
        paymentFrequency: 'Monthly',
        bankAccount: '•••• •••• •••• 9921',
        panNumber: 'USA-MKT-4412'
      },
      documents: [
        { id: 'doc_6', title: 'Employment Contract', category: 'Contract', uploadDate: '2023-04-10', fileSize: '1.9 MB' }
      ]
    },
    {
      id: 'emp_005',
      employeeId: 'EMP005',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@dayflow.io',
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 678-9012',
      address: '201 Harrison St, San Francisco, CA 94105',
      department: 'Finance',
      designation: 'Senior Financial Analyst',
      joiningDate: '2023-08-01',
      employmentType: 'Full-time',
      managerName: 'Elena Vance',
      status: 'Active',
      dob: '1993-07-14',
      gender: 'Female',
      skills: ['Financial Modeling', 'Budgeting & Forecasting', 'Payroll Accounting', 'QuickBooks', 'SaaS Metrics'],
      emergencyContact: { name: 'Thomas Jenkins', relation: 'Father', phone: '+1 (555) 432-8765' },
      salary: {
        baseSalary: 11000,
        hra: 2600,
        allowances: 1100,
        performanceBonus: 1000,
        taxDeduction: 2300,
        providentFund: 580,
        netSalary: 12820,
        currency: 'USD',
        paymentFrequency: 'Monthly',
        bankAccount: '•••• •••• •••• 3341',
        panNumber: 'USA-FIN-8822'
      },
      documents: [
        { id: 'doc_7', title: 'CFA Certificate', category: 'Certificate', uploadDate: '2023-08-01', fileSize: '3.1 MB' }
      ]
    },
    {
      id: 'emp_006',
      employeeId: 'EMP006',
      name: 'Alex Rivera',
      email: 'alex.rivera@dayflow.io',
      role: 'hr',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 789-0123',
      address: '680 Folsom St, San Francisco, CA 94107',
      department: 'Engineering',
      designation: 'Engineering Manager & Tech Lead',
      joiningDate: '2021-11-01',
      employmentType: 'Full-time',
      managerName: 'Elena Vance',
      status: 'Active',
      dob: '1989-12-03',
      gender: 'Male',
      skills: ['Engineering Management', 'System Architecture', 'Cloud Infrastructure', 'Agile Coaching'],
      emergencyContact: { name: 'Elena Rivera', relation: 'Spouse', phone: '+1 (555) 321-7654' },
      salary: {
        baseSalary: 15000,
        hra: 3600,
        allowances: 2200,
        performanceBonus: 2000,
        taxDeduction: 3500,
        providentFund: 900,
        netSalary: 18400,
        currency: 'USD',
        paymentFrequency: 'Monthly',
        bankAccount: '•••• •••• •••• 5612',
        panNumber: 'USA-ENG-1199'
      },
      documents: [
        { id: 'doc_8', title: 'Management Agreement', category: 'Contract', uploadDate: '2021-11-01', fileSize: '2.5 MB' }
      ]
    },
    {
      id: 'emp_007',
      employeeId: 'EMP007',
      name: 'Ananya Deshmukh',
      email: 'ananya.deshmukh@dayflow.io',
      role: 'hr',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 890-1234',
      address: '150 4th St, San Francisco, CA 94103',
      department: 'Human Resources',
      designation: 'Talent Acquisition & People Operations',
      joiningDate: '2023-05-20',
      employmentType: 'Full-time',
      managerName: 'Elena Vance',
      status: 'Active',
      dob: '1995-02-28',
      gender: 'Female',
      skills: ['Technical Recruiting', 'Onboarding', 'HR Operations', 'Workday', 'Employee Engagement'],
      emergencyContact: { name: 'Vikram Deshmukh', relation: 'Father', phone: '+1 (555) 210-9876' },
      salary: {
        baseSalary: 9500,
        hra: 2200,
        allowances: 900,
        performanceBonus: 800,
        taxDeduction: 1900,
        providentFund: 480,
        netSalary: 11020,
        currency: 'USD',
        paymentFrequency: 'Monthly',
        bankAccount: '•••• •••• •••• 6701',
        panNumber: 'USA-HR-5501'
      },
      documents: [
        { id: 'doc_9', title: 'HR Specialist Offer', category: 'Contract', uploadDate: '2023-05-20', fileSize: '1.7 MB' }
      ]
    },
    {
      id: 'emp_008',
      employeeId: 'EMP008',
      name: 'David Kim',
      email: 'david.kim@dayflow.io',
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 901-2345',
      address: '333 Fremont St, San Francisco, CA 94105',
      department: 'Customer Operations',
      designation: 'Customer Success Lead',
      joiningDate: '2023-09-15',
      employmentType: 'Full-time',
      managerName: 'Elena Vance',
      status: 'Active',
      dob: '1990-09-10',
      gender: 'Male',
      skills: ['Client Retention', 'Zendesk', 'NPS Optimization', 'Account Management', 'SLA Tracking'],
      emergencyContact: { name: 'Hannah Kim', relation: 'Sister', phone: '+1 (555) 109-8765' },
      salary: {
        baseSalary: 9800,
        hra: 2300,
        allowances: 950,
        performanceBonus: 1000,
        taxDeduction: 2000,
        providentFund: 500,
        netSalary: 11550,
        currency: 'USD',
        paymentFrequency: 'Monthly',
        bankAccount: '•••• •••• •••• 7743',
        panNumber: 'USA-OPS-2299'
      },
      documents: [
        { id: 'doc_10', title: 'Customer Operations Contract', category: 'Contract', uploadDate: '2023-09-15', fileSize: '2.0 MB' }
      ]
    },
    {
      id: 'emp_009',
      employeeId: 'EMP009',
      name: 'Jessica Taylor',
      email: 'jessica.taylor@dayflow.io',
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 012-3456',
      address: '88 King St, San Francisco, CA 94107',
      department: 'Engineering',
      designation: 'Senior QA Automation Engineer',
      joiningDate: '2024-01-10',
      employmentType: 'Full-time',
      managerName: 'Alex Rivera',
      status: 'Active',
      dob: '1993-05-18',
      gender: 'Female',
      skills: ['Playwright', 'Cypress', 'CI/CD Pipelines', 'Load Testing', 'Jest/Vitest'],
      emergencyContact: { name: 'Robert Taylor', relation: 'Spouse', phone: '+1 (555) 998-1122' },
      salary: {
        baseSalary: 11200,
        hra: 2700,
        allowances: 1100,
        performanceBonus: 1000,
        taxDeduction: 2300,
        providentFund: 580,
        netSalary: 13120,
        currency: 'USD',
        paymentFrequency: 'Monthly',
        bankAccount: '•••• •••• •••• 2189',
        panNumber: 'USA-QA-9011'
      },
      documents: [
        { id: 'doc_11', title: 'QA Engineer Agreement', category: 'Contract', uploadDate: '2024-01-10', fileSize: '1.6 MB' }
      ]
    },
    {
      id: 'emp_010',
      employeeId: 'EMP010',
      name: 'Omar Farooq',
      email: 'omar.farooq@dayflow.io',
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 123-4567',
      address: '400 Mission St, San Francisco, CA 94105',
      department: 'Security & Compliance',
      designation: 'Senior InfoSec & Compliance Lead',
      joiningDate: '2024-03-01',
      employmentType: 'Full-time',
      managerName: 'Alex Rivera',
      status: 'Active',
      dob: '1987-10-30',
      gender: 'Male',
      skills: ['SOC2 Type II', 'GDPR / CCPA', 'Vulnerability Assessment', 'Zero Trust', 'AWS IAM'],
      emergencyContact: { name: 'Zahra Farooq', relation: 'Spouse', phone: '+1 (555) 887-2233' },
      salary: {
        baseSalary: 13500,
        hra: 3200,
        allowances: 1600,
        performanceBonus: 1400,
        taxDeduction: 2900,
        providentFund: 720,
        netSalary: 16080,
        currency: 'USD',
        paymentFrequency: 'Monthly',
        bankAccount: '•••• •••• •••• 9032',
        panNumber: 'USA-SEC-4402'
      },
      documents: [
        { id: 'doc_12', title: 'CISSP Credentials', category: 'Certificate', uploadDate: '2024-03-01', fileSize: '2.8 MB' }
      ]
    }
  ];

  const initialUsers = initialEmployees.map(emp => ({
    id: 'user_' + emp.id,
    employeeId: emp.employeeId,
    name: emp.name,
    email: emp.email,
    passwordHash: defaultPasswordHash,
    role: emp.role as any,
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  }));

  const initialLeaveBalances: Record<string, any> = {};
  initialEmployees.forEach(emp => {
    initialLeaveBalances[emp.employeeId] = {
      employeeId: emp.employeeId,
      paidTotal: 24,
      paidUsed: emp.employeeId === 'EMP002' ? 4 : emp.employeeId === 'EMP003' ? 2 : 1,
      sickTotal: 12,
      sickUsed: emp.employeeId === 'EMP002' ? 1 : 0,
      casualTotal: 6,
      casualUsed: 0,
      unpaidUsed: 0
    };
  });

  // Generate historical attendance for the last 14 days
  const initialAttendance: any[] = [];
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    const dateStr = d.toISOString().split('T')[0];

    initialEmployees.forEach(emp => {
      // Deterministic realistic attendance simulation
      const rand = (parseInt(emp.employeeId.replace('EMP', '')) * 13 + i * 7) % 100;
      let status = 'Present';
      let checkIn = '09:0' + (rand % 9) + ':15';
      let checkOut = '17:4' + (rand % 9) + ':30';
      let duration = 515 + (rand % 30);

      if (i === 0) {
        // Today's record
        if (emp.employeeId === 'EMP002' || emp.employeeId === 'EMP001' || emp.employeeId === 'EMP003') {
          status = 'Present';
          checkIn = '08:55:20';
          checkOut = undefined as any;
          duration = undefined as any;
        } else if (emp.employeeId === 'EMP004') {
          status = 'On Leave';
          checkIn = undefined as any;
          checkOut = undefined as any;
          duration = undefined as any;
        } else {
          status = 'Present';
          checkIn = '09:12:05';
          checkOut = undefined as any;
          duration = undefined as any;
        }
      } else {
        if (rand > 92) {
          status = 'On Leave';
          checkIn = undefined as any;
          checkOut = undefined as any;
          duration = undefined as any;
        } else if (rand > 85) {
          status = 'Half-day';
          checkIn = '09:10:00';
          checkOut = '13:30:00';
          duration = 260;
        } else if (rand > 80 && emp.employeeId === 'EMP008') {
          status = 'Absent';
          checkIn = undefined as any;
          checkOut = undefined as any;
          duration = undefined as any;
        }
      }

      initialAttendance.push({
        id: `att_${emp.employeeId}_${dateStr}`,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.department,
        date: dateStr,
        checkInTime: checkIn,
        checkOutTime: checkOut,
        durationMinutes: duration,
        status: status,
        checkInNote: status === 'Present' ? 'On-site Office Badge' : undefined,
        ipAddress: '192.168.1.' + (10 + (rand % 50)),
        location: 'San Francisco HQ (Floor 4)'
      });
    });
  }

  // Initial Leave Requests
  const initialLeaves = [
    {
      id: 'leave_101',
      employeeId: 'EMP002',
      employeeName: 'Marcus Chen',
      department: 'Engineering',
      leaveType: 'Paid',
      startDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      daysCount: 3,
      reason: 'Family vacation and attending React Summit conference',
      status: 'Pending',
      appliedAt: new Date(Date.now() - 24 * 3600000).toISOString()
    },
    {
      id: 'leave_102',
      employeeId: 'EMP003',
      employeeName: 'Priya Patel',
      department: 'Product & Design',
      leaveType: 'Sick',
      startDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      endDate: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
      daysCount: 2,
      reason: 'Seasonal flu and doctor recommended bed rest',
      status: 'Approved',
      appliedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      reviewedBy: 'Elena Vance (HR Admin)',
      reviewedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      adminRemarks: 'Approved. Get well soon Priya!'
    },
    {
      id: 'leave_103',
      employeeId: 'EMP004',
      employeeName: 'Liam Sullivan',
      department: 'Marketing',
      leaveType: 'Paid',
      startDate: today.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      daysCount: 1,
      reason: 'Personal urgent personal matter',
      status: 'Approved',
      appliedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
      reviewedBy: 'Elena Vance (HR Admin)',
      reviewedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      adminRemarks: 'Approved for 1 day personal time off.'
    },
    {
      id: 'leave_104',
      employeeId: 'EMP009',
      employeeName: 'Jessica Taylor',
      department: 'Engineering',
      leaveType: 'Casual',
      startDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 11 * 86400000).toISOString().split('T')[0],
      daysCount: 2,
      reason: 'Moving to new apartment downtown',
      status: 'Pending',
      appliedAt: new Date().toISOString()
    }
  ];

  // Initial Payslips for past 2 months
  const months = ['July 2026', 'June 2026'];
  const initialPayslips: any[] = [];

  months.forEach((month, idx) => {
    initialEmployees.forEach(emp => {
      initialPayslips.push({
        id: `pay_${emp.employeeId}_${month.replace(' ', '_')}`,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.department,
        designation: emp.designation,
        month: month,
        year: 2026,
        baseSalary: emp.salary.baseSalary,
        hra: emp.salary.hra,
        allowances: emp.salary.allowances,
        bonuses: emp.salary.performanceBonus,
        taxDeductions: emp.salary.taxDeduction,
        pfDeductions: emp.salary.providentFund,
        netPay: emp.salary.netSalary,
        status: 'Paid',
        paymentDate: `2026-0${7 - idx}-28`,
        transactionId: `TXN-DAYFLOW-${202607 - idx}-${emp.employeeId}`
      });
    });
  });

  // Initial Notifications
  const initialNotifications = [
    {
      id: 'notif_1',
      recipientEmployeeId: 'EMP002',
      title: 'Leave Request Received',
      message: 'Your leave application for 3 days has been submitted and is queued for HR review.',
      type: 'leave',
      isRead: false,
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'notif_2',
      roleTarget: 'admin',
      title: 'New Leave Request Queued',
      message: 'Marcus Chen submitted a Paid Leave request (3 days). Review pending.',
      type: 'leave',
      isRead: false,
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'notif_3',
      recipientEmployeeId: 'EMP003',
      title: 'Leave Request Approved',
      message: 'Your sick leave request for 2 days was approved by Elena Vance.',
      type: 'success',
      isRead: true,
      timestamp: new Date(Date.now() - 86400000 * 6).toISOString()
    },
    {
      id: 'notif_4',
      recipientEmployeeId: 'EMP002',
      title: 'July 2026 Payslip Ready',
      message: 'Your July 2026 salary of $15,200.00 has been credited to your bank account.',
      type: 'payroll',
      isRead: true,
      timestamp: '2026-07-28T10:00:00Z'
    },
    {
      id: 'notif_5',
      title: 'Company All-Hands Meeting',
      message: 'Quarterly Town Hall scheduled for this Friday at 3:00 PM PST in Room Olympus & Zoom.',
      type: 'info',
      isRead: false,
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  // Initial Audit Logs
  const initialAuditLogs = [
    {
      id: 'audit_01',
      actorId: 'EMP001',
      actorName: 'Elena Vance',
      actorRole: 'admin',
      action: 'System Seed Initialized',
      targetEntity: 'System',
      targetId: 'DAYFLOW_ROOT',
      details: 'Initial organizational baseline, employees, leave rules, and salary structures bootstrapped.',
      timestamp: new Date(Date.now() - 86400000 * 14).toISOString()
    },
    {
      id: 'audit_02',
      actorId: 'EMP001',
      actorName: 'Elena Vance',
      actorRole: 'admin',
      action: 'Leave Approved',
      targetEntity: 'Leave',
      targetId: 'leave_102',
      details: 'Approved Sick Leave for Priya Patel (2 days). Reason: seasonal flu.',
      timestamp: new Date(Date.now() - 86400000 * 6).toISOString()
    },
    {
      id: 'audit_03',
      actorId: 'EMP001',
      actorName: 'Elena Vance',
      actorRole: 'admin',
      action: 'Payroll Run Executed',
      targetEntity: 'Payroll',
      targetId: 'BATCH_JULY_2026',
      details: 'Processed July 2026 payroll run across 10 active organizational records ($142,440 total payout).',
      timestamp: '2026-07-28T11:30:00Z'
    }
  ];

  db = {
    users: initialUsers,
    employees: initialEmployees,
    attendance: initialAttendance,
    leaveRequests: initialLeaves,
    leaveBalances: initialLeaveBalances,
    payslips: initialPayslips,
    notifications: initialNotifications,
    auditLogs: initialAuditLogs,
    sessions: {}
  };

  saveDatabase();
  console.log('Database initialized successfully with 10 employees, full attendance history & audit logs.');
}

loadDatabase();

// --- Audit Log Helper ---
function logAudit(actor: { id: string; name: string; role: any }, action: string, targetEntity: any, targetId: string, details: string, metadata?: any) {
  const auditEntry = {
    id: 'audit_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action,
    targetEntity,
    targetId,
    details,
    metadata,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(auditEntry);
  if (db.auditLogs.length > 500) db.auditLogs.pop();
  saveDatabase();
  return auditEntry;
}

// --- Notification Dispatcher Helper ---
function sendNotification(data: { recipientEmployeeId?: string; roleTarget?: any; title: string; message: string; type: any; link?: string }) {
  const notif = {
    id: 'notif_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    ...data,
    isRead: false,
    timestamp: new Date().toISOString()
  };
  db.notifications.unshift(notif);
  saveDatabase();
  return notif;
}

// --- Authentication Middleware ---
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required. No authorization token provided.' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const session = db.sessions[token];

  if (!session || session.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'Session has expired or token is invalid. Please sign in again.' });
  }

  const user = db.users.find(u => u.id === session.userId);
  const employee = db.employees.find(e => e.employeeId === session.employeeId);

  if (!user) {
    return res.status(401).json({ error: 'User record not found.' });
  }

  (req as any).user = user;
  (req as any).employee = employee;
  (req as any).token = token;
  next();
}

function requireRole(roles: Array<'admin' | 'hr' | 'employee'>) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges for this operation.' });
    }
    next();
  };
}

// ==========================================
// API ROUTES
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), employeesCount: db.employees.length });
});

// --- Auth Routes ---

// Sign Up
app.post('/api/auth/register', (req, res) => {
  try {
    const { employeeId, name, email, password, role = 'employee', department = 'Engineering', designation = 'Associate' } = req.body;

    if (!employeeId || !name || !email || !password) {
      return res.status(400).json({ error: 'Employee ID, full name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters with numbers and letters.' });
    }

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.employeeId.toUpperCase() === employeeId.toUpperCase());
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address or Employee ID already exists.' });
    }

    const cleanEmpId = employeeId.toUpperCase();
    const newUserId = 'user_' + Date.now();
    const passwordHash = hashPassword(password);

    const newUser = {
      id: newUserId,
      employeeId: cleanEmpId,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role as any,
      isEmailVerified: true,
      createdAt: new Date().toISOString()
    };

    let emp = db.employees.find(e => e.employeeId === cleanEmpId);
    if (!emp) {
      emp = {
        id: 'emp_' + Date.now(),
        employeeId: cleanEmpId,
        name,
        email: email.toLowerCase(),
        role: role as any,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        phone: '+1 (555) 000-0000',
        address: 'HQ Remote Access',
        department: department,
        designation: designation,
        joiningDate: new Date().toISOString().split('T')[0],
        employmentType: 'Full-time',
        managerName: 'Elena Vance',
        status: 'Active',
        salary: {
          baseSalary: 8000,
          hra: 2000,
          allowances: 800,
          performanceBonus: 500,
          taxDeduction: 1500,
          providentFund: 400,
          netSalary: 9400,
          currency: 'USD',
          paymentFrequency: 'Monthly',
          bankAccount: '•••• •••• •••• 0000'
        },
        documents: []
      };
      db.employees.push(emp);
    }

    db.users.push(newUser);

    if (!db.leaveBalances[cleanEmpId]) {
      db.leaveBalances[cleanEmpId] = {
        employeeId: cleanEmpId,
        paidTotal: 24,
        paidUsed: 0,
        sickTotal: 12,
        sickUsed: 0,
        casualTotal: 6,
        casualUsed: 0,
        unpaidUsed: 0
      };
    }

    // Create session token
    const token = crypto.randomUUID();
    db.sessions[token] = {
      userId: newUser.id,
      role: newUser.role,
      employeeId: cleanEmpId,
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000
    };

    logAudit(
      { id: cleanEmpId, name, role: role as any },
      'User Account Registered',
      'Auth',
      cleanEmpId,
      `New employee registration created for ${name} (${email}).`
    );

    sendNotification({
      recipientEmployeeId: cleanEmpId,
      title: 'Welcome to Dayflow HRMS!',
      message: 'Your account is ready. Explore your dashboard, attendance clock, and leave center.',
      type: 'info'
    });

    saveDatabase();

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({
      token,
      user: safeUser,
      employee: emp
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Registration failed: ' + (err.message || 'Internal error') });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const calculatedHash = hashPassword(password);
    if (user.passwordHash !== calculatedHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const employee = db.employees.find(e => e.employeeId === user.employeeId);

    // Create session token
    const token = crypto.randomUUID();
    db.sessions[token] = {
      userId: user.id,
      role: user.role,
      employeeId: user.employeeId,
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000
    };

    saveDatabase();

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      token,
      user: safeUser,
      employee
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Login error: ' + (err.message || 'Internal error') });
  }
});

// Demo Login (Instant evaluation switch for hackathon judges & testers)
app.post('/api/auth/demo-login', (req, res) => {
  try {
    const { employeeId } = req.body;
    const targetEmpId = employeeId || 'EMP001';

    const user = db.users.find(u => u.employeeId === targetEmpId) || db.users[0];
    if (!user) {
      return res.status(404).json({ error: 'Demo user not found.' });
    }

    const employee = db.employees.find(e => e.employeeId === user.employeeId);

    const token = crypto.randomUUID();
    db.sessions[token] = {
      userId: user.id,
      role: user.role,
      employeeId: user.employeeId,
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000
    };

    saveDatabase();

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      token,
      user: safeUser,
      employee
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Demo login failed.' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const employee = (req as any).employee;
  const { passwordHash: _, ...safeUser } = user;
  res.json({
    user: safeUser,
    employee
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    delete db.sessions[token];
    saveDatabase();
  }
  res.json({ message: 'Signed out successfully.' });
});

// --- Employee Management Routes ---

// Get list of employees with search, filter, sort
app.get('/api/employees', authMiddleware, (req, res) => {
  const { search, department, role, status, sortBy = 'employeeId', sortOrder = 'asc' } = req.query;
  const currentUser = (req as any).user;

  let list = [...db.employees];

  // Search filter
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.employeeId.toLowerCase().includes(q) ||
      e.designation.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  }

  // Department filter
  if (department && department !== 'All') {
    list = list.filter(e => e.department === department);
  }

  // Role filter
  if (role && role !== 'All') {
    list = list.filter(e => e.role === role);
  }

  // Status filter
  if (status && status !== 'All') {
    list = list.filter(e => e.status === status);
  }

  // Sorting
  list.sort((a, b) => {
    let valA = a[sortBy as string] || '';
    let valB = b[sortBy as string] || '';
    if (typeof valA === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  // If user is employee, mask other employees' detailed private salary info if accessed via list
  if (currentUser.role === 'employee') {
    list = list.map(emp => {
      if (emp.employeeId !== currentUser.employeeId) {
        const { salary, documents, emergencyContact, ...publicEmp } = emp;
        return publicEmp;
      }
      return emp;
    });
  }

  res.json({
    total: list.length,
    employees: list
  });
});

// Get Single Employee by ID
app.get('/api/employees/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const currentUser = (req as any).user;
  const emp = db.employees.find(e => e.employeeId === id || e.id === id);

  if (!emp) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  // Enforce data privacy: Regular employees cannot view full private details (salary, docs) of others
  if (currentUser.role === 'employee' && emp.employeeId !== currentUser.employeeId) {
    const { salary, documents, emergencyContact, bankAccount, ...safePublicProfile } = emp;
    return res.json(safePublicProfile);
  }

  res.json(emp);
});

// Create Employee (Admin/HR only)
app.post('/api/employees', authMiddleware, requireRole(['admin', 'hr']), (req, res) => {
  try {
    const currentUser = (req as any).user;
    const {
      name,
      email,
      role = 'employee',
      phone = '',
      address = '',
      department,
      designation,
      joiningDate,
      employmentType = 'Full-time',
      managerName = 'Elena Vance',
      status = 'Active',
      salary = {},
      dob,
      gender,
      skills = []
    } = req.body;

    if (!name || !email || !department || !designation) {
      return res.status(400).json({ error: 'Name, email, department, and designation are mandatory.' });
    }

    // Auto-generate next Employee ID (e.g. EMP011)
    const existingIds = db.employees
      .map(e => parseInt(e.employeeId.replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n));
    const nextNum = (existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1);
    const employeeId = `EMP${nextNum.toString().padStart(3, '0')}`;

    const baseSalary = Number(salary.baseSalary) || 8000;
    const hra = Number(salary.hra) || Math.round(baseSalary * 0.25);
    const allowances = Number(salary.allowances) || 1000;
    const performanceBonus = Number(salary.performanceBonus) || 500;
    const taxDeduction = Number(salary.taxDeduction) || Math.round(baseSalary * 0.20);
    const providentFund = Number(salary.providentFund) || Math.round(baseSalary * 0.05);
    const netSalary = baseSalary + hra + allowances + performanceBonus - taxDeduction - providentFund;

    const newEmp = {
      id: 'emp_' + Date.now(),
      employeeId,
      name,
      email: email.toLowerCase(),
      role: role as any,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      phone,
      address,
      department,
      designation,
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      employmentType,
      managerName,
      status,
      dob,
      gender,
      skills: Array.isArray(skills) ? skills : [skills],
      salary: {
        baseSalary,
        hra,
        allowances,
        performanceBonus,
        taxDeduction,
        providentFund,
        netSalary,
        currency: 'USD',
        paymentFrequency: 'Monthly',
        bankAccount: salary.bankAccount || '•••• •••• •••• ' + Math.floor(1000 + Math.random() * 9000),
        panNumber: salary.panNumber || 'USA-EMP-' + nextNum
      },
      documents: []
    };

    db.employees.push(newEmp);

    // Create user login account
    const userAcc = {
      id: 'user_' + Date.now(),
      employeeId,
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword('Password123!'),
      role: role as any,
      isEmailVerified: true,
      createdAt: new Date().toISOString()
    };
    db.users.push(userAcc);

    // Initialize leave balance
    db.leaveBalances[employeeId] = {
      employeeId,
      paidTotal: 24,
      paidUsed: 0,
      sickTotal: 12,
      sickUsed: 0,
      casualTotal: 6,
      casualUsed: 0,
      unpaidUsed: 0
    };

    logAudit(
      currentUser,
      'Employee Created',
      'Employee',
      employeeId,
      `Created new employee record for ${name} (${employeeId}) in ${department}.`
    );

    saveDatabase();
    res.status(201).json(newEmp);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create employee: ' + err.message });
  }
});

// Update Employee Details
app.put('/api/employees/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    const empIndex = db.employees.findIndex(e => e.employeeId === id || e.id === id);

    if (empIndex === -1) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const currentEmp = db.employees[empIndex];
    const isSelf = currentUser.employeeId === currentEmp.employeeId;
    const isAdminOrHr = currentUser.role === 'admin' || currentUser.role === 'hr';

    if (!isSelf && !isAdminOrHr) {
      return res.status(403).json({ error: 'You do not have permission to update this profile.' });
    }

    const updates = req.body;

    if (isSelf && !isAdminOrHr) {
      // Employee self-service restrictions: only permitted personal fields
      const allowedFields = ['phone', 'address', 'avatar', 'emergencyContact', 'dob', 'gender', 'skills'];
      allowedFields.forEach(f => {
        if (updates[f] !== undefined) {
          currentEmp[f] = updates[f];
        }
      });

      logAudit(
        currentUser,
        'Profile Updated (Self-Service)',
        'Employee',
        currentEmp.employeeId,
        `${currentUser.name} updated personal contact and profile details.`
      );
    } else {
      // Admin / HR can update all fields including designation, department, status, role, salary
      if (updates.name) currentEmp.name = updates.name;
      if (updates.email) currentEmp.email = updates.email.toLowerCase();
      if (updates.phone !== undefined) currentEmp.phone = updates.phone;
      if (updates.address !== undefined) currentEmp.address = updates.address;
      if (updates.department) currentEmp.department = updates.department;
      if (updates.designation) currentEmp.designation = updates.designation;
      if (updates.status) currentEmp.status = updates.status;
      if (updates.employmentType) currentEmp.employmentType = updates.employmentType;
      if (updates.managerName) currentEmp.managerName = updates.managerName;
      if (updates.role) {
        currentEmp.role = updates.role;
        const userAcc = db.users.find(u => u.employeeId === currentEmp.employeeId);
        if (userAcc) userAcc.role = updates.role;
      }
      if (updates.avatar) currentEmp.avatar = updates.avatar;
      if (updates.emergencyContact) currentEmp.emergencyContact = updates.emergencyContact;
      if (updates.skills) currentEmp.skills = updates.skills;

      // Salary update recalculation if provided
      if (updates.salary) {
        const s = updates.salary;
        const baseSalary = Number(s.baseSalary) ?? currentEmp.salary.baseSalary;
        const hra = Number(s.hra) ?? currentEmp.salary.hra;
        const allowances = Number(s.allowances) ?? currentEmp.salary.allowances;
        const performanceBonus = Number(s.performanceBonus) ?? currentEmp.salary.performanceBonus;
        const taxDeduction = Number(s.taxDeduction) ?? currentEmp.salary.taxDeduction;
        const providentFund = Number(s.providentFund) ?? currentEmp.salary.providentFund;
        const netSalary = baseSalary + hra + allowances + performanceBonus - taxDeduction - providentFund;

        currentEmp.salary = {
          ...currentEmp.salary,
          ...s,
          baseSalary,
          hra,
          allowances,
          performanceBonus,
          taxDeduction,
          providentFund,
          netSalary
        };
      }

      logAudit(
        currentUser,
        'Employee Profile Updated (Admin)',
        'Employee',
        currentEmp.employeeId,
        `HR/Admin ${currentUser.name} modified profile & compensation for ${currentEmp.name}.`
      );
    }

    db.employees[empIndex] = currentEmp;
    saveDatabase();
    res.json(currentEmp);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update employee: ' + err.message });
  }
});

// Deactivate or Delete Employee (Admin only)
app.delete('/api/employees/:id', authMiddleware, requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  const currentUser = (req as any).user;
  const empIndex = db.employees.findIndex(e => e.employeeId === id || e.id === id);

  if (empIndex === -1) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  const emp = db.employees[empIndex];
  emp.status = 'Terminated';

  logAudit(
    currentUser,
    'Employee Status Set to Terminated',
    'Employee',
    emp.employeeId,
    `Admin ${currentUser.name} deactivated employee status for ${emp.name}.`
  );

  saveDatabase();
  res.json({ message: `Employee ${emp.name} (${emp.employeeId}) deactivated successfully.` });
});

// --- Attendance Management Routes ---

// Get Attendance Records
app.get('/api/attendance', authMiddleware, (req, res) => {
  const { employeeId, date, department, status, month } = req.query;
  const currentUser = (req as any).user;

  let records = [...db.attendance];

  // If regular employee, only allowed to fetch their own attendance records
  if (currentUser.role === 'employee') {
    records = records.filter(r => r.employeeId === currentUser.employeeId);
  } else if (employeeId && employeeId !== 'All') {
    records = records.filter(r => r.employeeId === employeeId);
  }

  if (date) {
    records = records.filter(r => r.date === date);
  }

  if (month) {
    records = records.filter(r => r.date.startsWith(month as string));
  }

  if (department && department !== 'All') {
    records = records.filter(r => r.department === department);
  }

  if (status && status !== 'All') {
    records = records.filter(r => r.status === status);
  }

  records.sort((a, b) => b.date.localeCompare(a.date));

  res.json({
    total: records.length,
    records
  });
});

// Get Today's Status for Current User + Organization Stats
app.get('/api/attendance/today-summary', authMiddleware, (req, res) => {
  const currentUser = (req as any).user;
  const todayStr = new Date().toISOString().split('T')[0];

  const userTodayRecord = db.attendance.find(r => r.employeeId === currentUser.employeeId && r.date === todayStr);

  const todayRecords = db.attendance.filter(r => r.date === todayStr);
  const presentCount = todayRecords.filter(r => r.status === 'Present').length;
  const absentCount = todayRecords.filter(r => r.status === 'Absent').length;
  const onLeaveCount = todayRecords.filter(r => r.status === 'On Leave').length;
  const halfDayCount = todayRecords.filter(r => r.status === 'Half-day').length;

  res.json({
    date: todayStr,
    userRecord: userTodayRecord || null,
    isCheckedIn: !!userTodayRecord?.checkInTime && !userTodayRecord?.checkOutTime,
    isCheckedOut: !!userTodayRecord?.checkOutTime,
    stats: {
      totalEmployees: db.employees.filter(e => e.status === 'Active').length,
      present: presentCount,
      absent: absentCount,
      onLeave: onLeaveCount,
      halfDay: halfDayCount
    }
  });
});

// Employee Check-In
app.post('/api/attendance/check-in', authMiddleware, (req, res) => {
  try {
    const currentUser = (req as any).user;
    const employee = (req as any).employee;
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toTimeString().split(' ')[0]; // HH:mm:ss

    // Check if already checked in today
    const existing = db.attendance.find(r => r.employeeId === currentUser.employeeId && r.date === todayStr);

    if (existing && existing.checkInTime) {
      return res.status(400).json({ error: `Already checked in today at ${existing.checkInTime}.` });
    }

    if (existing) {
      existing.checkInTime = nowTimeStr;
      existing.status = 'Present';
      existing.location = req.body.location || 'San Francisco HQ (Floor 4)';
      existing.ipAddress = req.ip || '192.168.1.45';
      saveDatabase();
      return res.json({ message: 'Checked in successfully!', record: existing });
    }

    const newRecord = {
      id: `att_${currentUser.employeeId}_${todayStr}`,
      employeeId: currentUser.employeeId,
      employeeName: currentUser.name,
      department: employee ? employee.department : 'Engineering',
      date: todayStr,
      checkInTime: nowTimeStr,
      checkOutTime: undefined,
      durationMinutes: undefined,
      status: 'Present',
      checkInNote: req.body.note || 'Web Portal Check-in',
      ipAddress: req.ip || '192.168.1.45',
      location: req.body.location || 'San Francisco HQ (Floor 4)'
    };

    db.attendance.unshift(newRecord);

    logAudit(
      currentUser,
      'Attendance Check-In',
      'Attendance',
      newRecord.id,
      `${currentUser.name} checked in for work on ${todayStr} at ${nowTimeStr}.`
    );

    saveDatabase();
    res.status(201).json({ message: 'Checked in successfully!', record: newRecord });
  } catch (err: any) {
    res.status(500).json({ error: 'Check-in failed: ' + err.message });
  }
});

// Employee Check-Out
app.post('/api/attendance/check-out', authMiddleware, (req, res) => {
  try {
    const currentUser = (req as any).user;
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toTimeString().split(' ')[0]; // HH:mm:ss

    const record = db.attendance.find(r => r.employeeId === currentUser.employeeId && r.date === todayStr);

    if (!record || !record.checkInTime) {
      return res.status(400).json({ error: 'Cannot check out before checking in for today.' });
    }

    if (record.checkOutTime) {
      return res.status(400).json({ error: `Already checked out today at ${record.checkOutTime}.` });
    }

    record.checkOutTime = nowTimeStr;

    // Calculate duration in minutes
    const [inH, inM, inS] = record.checkInTime.split(':').map(Number);
    const [outH, outM, outS] = nowTimeStr.split(':').map(Number);
    const inTotalM = inH * 60 + inM;
    const outTotalM = outH * 60 + outM;
    const duration = Math.max(0, outTotalM - inTotalM);

    record.durationMinutes = duration;

    // If worked less than 4 hours, mark as Half-day
    if (duration < 240 && record.status === 'Present') {
      record.status = 'Half-day';
    }

    logAudit(
      currentUser,
      'Attendance Check-Out',
      'Attendance',
      record.id,
      `${currentUser.name} checked out on ${todayStr} at ${nowTimeStr} (Duration: ${Math.floor(duration / 60)}h ${duration % 60}m).`
    );

    saveDatabase();
    res.json({ message: 'Checked out successfully!', record });
  } catch (err: any) {
    res.status(500).json({ error: 'Check-out failed: ' + err.message });
  }
});

// Admin Manual Attendance Adjustment
app.post('/api/attendance/manual-record', authMiddleware, requireRole(['admin', 'hr']), (req, res) => {
  try {
    const currentUser = (req as any).user;
    const { employeeId, date, checkInTime, checkOutTime, status = 'Present', note } = req.body;

    if (!employeeId || !date) {
      return res.status(400).json({ error: 'Employee ID and date are required.' });
    }

    const emp = db.employees.find(e => e.employeeId === employeeId);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    let record = db.attendance.find(r => r.employeeId === employeeId && r.date === date);
    let duration = undefined;
    if (checkInTime && checkOutTime) {
      const [inH, inM] = checkInTime.split(':').map(Number);
      const [outH, outM] = checkOutTime.split(':').map(Number);
      duration = Math.max(0, (outH * 60 + outM) - (inH * 60 + inM));
    }

    if (record) {
      record.checkInTime = checkInTime;
      record.checkOutTime = checkOutTime;
      record.status = status;
      record.durationMinutes = duration;
      record.checkInNote = note || 'Admin Adjustment';
    } else {
      record = {
        id: `att_${employeeId}_${date}`,
        employeeId,
        employeeName: emp.name,
        department: emp.department,
        date,
        checkInTime,
        checkOutTime,
        durationMinutes: duration,
        status,
        checkInNote: note || 'Admin Added Record',
        ipAddress: '127.0.0.1',
        location: 'HR Manual Adjustment'
      };
      db.attendance.unshift(record);
    }

    logAudit(
      currentUser,
      'Attendance Record Adjusted',
      'Attendance',
      record.id,
      `HR/Admin ${currentUser.name} manually updated attendance for ${emp.name} on ${date} (Status: ${status}).`
    );

    saveDatabase();
    res.json({ message: 'Attendance record saved successfully.', record });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to adjust attendance: ' + err.message });
  }
});

// --- Leave Management Routes ---

// Get Leaves
app.get('/api/leaves', authMiddleware, (req, res) => {
  const { employeeId, status, leaveType } = req.query;
  const currentUser = (req as any).user;

  let list = [...db.leaveRequests];

  if (currentUser.role === 'employee') {
    list = list.filter(l => l.employeeId === currentUser.employeeId);
  } else if (employeeId && employeeId !== 'All') {
    list = list.filter(l => l.employeeId === employeeId);
  }

  if (status && status !== 'All') {
    list = list.filter(l => l.status === status);
  }

  if (leaveType && leaveType !== 'All') {
    list = list.filter(l => l.leaveType === leaveType);
  }

  list.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

  res.json({
    total: list.length,
    leaves: list
  });
});

// Get Leave Balance
app.get('/api/leaves/balances/:employeeId', authMiddleware, (req, res) => {
  const { employeeId } = req.params;
  const currentUser = (req as any).user;

  if (currentUser.role === 'employee' && currentUser.employeeId !== employeeId) {
    return res.status(403).json({ error: 'Cannot view leave balance of another employee.' });
  }

  const balance = db.leaveBalances[employeeId] || {
    employeeId,
    paidTotal: 24,
    paidUsed: 0,
    sickTotal: 12,
    sickUsed: 0,
    casualTotal: 6,
    casualUsed: 0,
    unpaidUsed: 0
  };

  res.json(balance);
});

// Apply for Leave
app.post('/api/leaves', authMiddleware, (req, res) => {
  try {
    const currentUser = (req as any).user;
    const employee = (req as any).employee;
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'Leave type, start date, end date, and reason are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ error: 'End date cannot be prior to start date.' });
    }

    // Calculate days count excluding weekends
    let daysCount = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) daysCount++;
      cur.setDate(cur.getDate() + 1);
    }

    if (daysCount === 0) {
      return res.status(400).json({ error: 'Selected date range contains no working business days.' });
    }

    // Check overlapping pending/approved leaves
    const overlap = db.leaveRequests.find(l =>
      l.employeeId === currentUser.employeeId &&
      l.status !== 'Rejected' &&
      ((startDate >= l.startDate && startDate <= l.endDate) ||
       (endDate >= l.startDate && endDate <= l.endDate) ||
       (startDate <= l.startDate && endDate >= l.endDate))
    );

    if (overlap) {
      return res.status(400).json({ error: `You already have an active leave request (${overlap.status}) for these overlapping dates.` });
    }

    const newLeave = {
      id: 'leave_' + Date.now(),
      employeeId: currentUser.employeeId,
      employeeName: currentUser.name,
      department: employee ? employee.department : 'Engineering',
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason,
      status: 'Pending',
      appliedAt: new Date().toISOString()
    };

    db.leaveRequests.unshift(newLeave);

    // Notify HR
    sendNotification({
      roleTarget: 'admin',
      title: 'New Leave Application',
      message: `${currentUser.name} applied for ${daysCount} day(s) of ${leaveType} leave (${startDate} to ${endDate}).`,
      type: 'leave'
    });

    logAudit(
      currentUser,
      'Leave Application Submitted',
      'Leave',
      newLeave.id,
      `${currentUser.name} applied for ${daysCount} days of ${leaveType} leave.`
    );

    saveDatabase();
    res.status(201).json({ message: 'Leave request submitted successfully.', leave: newLeave });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit leave: ' + err.message });
  }
});

// Approve or Reject Leave (Admin/HR only)
app.put('/api/leaves/:id/review', authMiddleware, requireRole(['admin', 'hr']), (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    const { status, adminRemarks = '' } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Approved or Rejected.' });
    }

    const leave = db.leaveRequests.find(l => l.id === id);
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found.' });
    }

    leave.status = status;
    leave.reviewedBy = `${currentUser.name} (${currentUser.role.toUpperCase()})`;
    leave.reviewedAt = new Date().toISOString();
    leave.adminRemarks = adminRemarks;

    // If approved, deduct from balance
    if (status === 'Approved') {
      const balance = db.leaveBalances[leave.employeeId] || {
        employeeId: leave.employeeId,
        paidTotal: 24,
        paidUsed: 0,
        sickTotal: 12,
        sickUsed: 0,
        casualTotal: 6,
        casualUsed: 0,
        unpaidUsed: 0
      };

      if (leave.leaveType === 'Paid') balance.paidUsed += leave.daysCount;
      else if (leave.leaveType === 'Sick') balance.sickUsed += leave.daysCount;
      else if (leave.leaveType === 'Casual') balance.casualUsed += leave.daysCount;
      else balance.unpaidUsed += leave.daysCount;

      db.leaveBalances[leave.employeeId] = balance;

      // Update today's attendance record if today falls in leave range
      const todayStr = new Date().toISOString().split('T')[0];
      if (todayStr >= leave.startDate && todayStr <= leave.endDate) {
        let att = db.attendance.find(r => r.employeeId === leave.employeeId && r.date === todayStr);
        if (att) {
          att.status = 'On Leave';
        } else {
          db.attendance.unshift({
            id: `att_${leave.employeeId}_${todayStr}`,
            employeeId: leave.employeeId,
            employeeName: leave.employeeName,
            department: leave.department,
            date: todayStr,
            status: 'On Leave',
            checkInNote: `Approved ${leave.leaveType} Leave`
          });
        }
      }
    }

    // Send notification to employee
    sendNotification({
      recipientEmployeeId: leave.employeeId,
      title: `Leave Request ${status}`,
      message: `Your ${leave.leaveType} leave request for ${leave.startDate} to ${leave.endDate} has been ${status.toLowerCase()} by ${currentUser.name}.${adminRemarks ? ` Remarks: "${adminRemarks}"` : ''}`,
      type: status === 'Approved' ? 'success' : 'warning'
    });

    logAudit(
      currentUser,
      `Leave Request ${status}`,
      'Leave',
      leave.id,
      `${currentUser.name} reviewed leave request for ${leave.employeeName} -> Status: ${status}. Remarks: ${adminRemarks || 'None'}`
    );

    saveDatabase();
    res.json({ message: `Leave request has been ${status.toLowerCase()}.`, leave });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to review leave: ' + err.message });
  }
});

// --- Payroll Routes ---

// Get Payroll Overview / Payslips
app.get('/api/payroll', authMiddleware, (req, res) => {
  const currentUser = (req as any).user;
  const { month, year, department, employeeId } = req.query;

  let list = [...db.payslips];

  if (currentUser.role === 'employee') {
    list = list.filter(p => p.employeeId === currentUser.employeeId);
  } else if (employeeId && employeeId !== 'All') {
    list = list.filter(p => p.employeeId === employeeId);
  }

  if (month && month !== 'All') {
    list = list.filter(p => p.month === month);
  }

  if (department && department !== 'All') {
    list = list.filter(p => p.department === department);
  }

  const totalPayroll = list.reduce((sum, p) => sum + (p.netPay || 0), 0);
  const totalBase = list.reduce((sum, p) => sum + (p.baseSalary || 0), 0);
  const totalTaxes = list.reduce((sum, p) => sum + (p.taxDeductions || 0), 0);

  res.json({
    totalCount: list.length,
    totalPayroll,
    totalBase,
    totalTaxes,
    payslips: list
  });
});

// Generate Monthly Payroll Batch (Admin only)
app.post('/api/payroll/generate-batch', authMiddleware, requireRole(['admin', 'hr']), (req, res) => {
  try {
    const currentUser = (req as any).user;
    const { month = 'August 2026', year = 2026 } = req.body;

    const activeEmployees = db.employees.filter(e => e.status !== 'Terminated');
    let createdCount = 0;

    activeEmployees.forEach(emp => {
      const payslipId = `pay_${emp.employeeId}_${month.replace(' ', '_')}`;
      const existing = db.payslips.find(p => p.id === payslipId);

      if (!existing) {
        const p = {
          id: payslipId,
          employeeId: emp.employeeId,
          employeeName: emp.name,
          department: emp.department,
          designation: emp.designation,
          month: month,
          year: Number(year),
          baseSalary: emp.salary.baseSalary,
          hra: emp.salary.hra,
          allowances: emp.salary.allowances,
          bonuses: emp.salary.performanceBonus,
          taxDeductions: emp.salary.taxDeduction,
          pfDeductions: emp.salary.providentFund,
          netPay: emp.salary.netSalary,
          status: 'Paid',
          paymentDate: new Date().toISOString().split('T')[0],
          transactionId: `TXN-DAYFLOW-${Date.now().toString().slice(-6)}-${emp.employeeId}`
        };
        db.payslips.unshift(p);
        createdCount++;

        // Notify employee
        sendNotification({
          recipientEmployeeId: emp.employeeId,
          title: `${month} Payslip Ready`,
          message: `Your payslip for ${month} ($${emp.salary.netSalary.toLocaleString()}) has been processed and credited.`,
          type: 'payroll'
        });
      }
    });

    logAudit(
      currentUser,
      'Batch Payroll Generated',
      'Payroll',
      `BATCH_${month.replace(' ', '_')}`,
      `${currentUser.name} triggered payroll batch execution for ${month} (${createdCount} new payslips generated).`
    );

    saveDatabase();
    res.json({ message: `Successfully generated ${createdCount} payslips for ${month}.`, createdCount });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate payroll batch: ' + err.message });
  }
});

// Update Salary Structure for an Employee (Admin only)
app.put('/api/payroll/salary-structure/:employeeId', authMiddleware, requireRole(['admin', 'hr']), (req, res) => {
  try {
    const { employeeId } = req.params;
    const currentUser = (req as any).user;
    const emp = db.employees.find(e => e.employeeId === employeeId);

    if (!emp) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const { baseSalary, hra, allowances, performanceBonus, taxDeduction, providentFund, bankAccount, panNumber } = req.body;

    const base = Number(baseSalary) || emp.salary.baseSalary;
    const h = Number(hra) || Math.round(base * 0.25);
    const allow = Number(allowances) || 0;
    const bonus = Number(performanceBonus) || 0;
    const tax = Number(taxDeduction) || Math.round(base * 0.20);
    const pf = Number(providentFund) || Math.round(base * 0.05);
    const net = base + h + allow + bonus - tax - pf;

    emp.salary = {
      ...emp.salary,
      baseSalary: base,
      hra: h,
      allowances: allow,
      performanceBonus: bonus,
      taxDeduction: tax,
      providentFund: pf,
      netSalary: net,
      bankAccount: bankAccount || emp.salary.bankAccount,
      panNumber: panNumber || emp.salary.panNumber
    };

    logAudit(
      currentUser,
      'Salary Structure Modified',
      'Payroll',
      emp.employeeId,
      `HR/Admin ${currentUser.name} updated compensation structure for ${emp.name} (New Net: $${net.toLocaleString()}/mo).`
    );

    sendNotification({
      recipientEmployeeId: emp.employeeId,
      title: 'Salary Structure Updated',
      message: 'Your official compensation package has been updated by HR. Check your payroll tab for details.',
      type: 'payroll'
    });

    saveDatabase();
    res.json({ message: 'Salary structure updated successfully.', salary: emp.salary });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update salary: ' + err.message });
  }
});

// --- Analytics Routes ---
app.get('/api/analytics', authMiddleware, (req, res) => {
  const activeEmployees = db.employees.filter(e => e.status === 'Active');
  const todayStr = new Date().toISOString().split('T')[0];

  const todayAttendance = db.attendance.filter(r => r.date === todayStr);
  const presentToday = todayAttendance.filter(r => r.status === 'Present').length;
  const absentToday = todayAttendance.filter(r => r.status === 'Absent').length;
  const onLeaveToday = todayAttendance.filter(r => r.status === 'On Leave').length;
  const halfDayToday = todayAttendance.filter(r => r.status === 'Half-day').length;

  const totalEmps = activeEmployees.length;
  const attendanceRate = totalEmps > 0 ? Math.round(((presentToday + halfDayToday * 0.5) / totalEmps) * 100) : 100;

  const pendingLeaves = db.leaveRequests.filter(l => l.status === 'Pending').length;
  const monthlyPayrollTotal = activeEmployees.reduce((sum, e) => sum + (e.salary?.netSalary || 0), 0);

  // Department breakdown
  const deptMap: Record<string, { count: number; budget: number }> = {};
  activeEmployees.forEach(e => {
    if (!deptMap[e.department]) {
      deptMap[e.department] = { count: 0, budget: 0 };
    }
    deptMap[e.department].count += 1;
    deptMap[e.department].budget += (e.salary?.netSalary || 0);
  });

  const departmentBreakdown = Object.entries(deptMap).map(([department, data]) => ({
    department,
    count: data.count,
    budget: data.budget
  }));

  // Attendance trends over past 7 distinct dates
  const dateMap: Record<string, { present: number; absent: number; halfDay: number; onLeave: number }> = {};
  const sortedAtt = [...db.attendance].sort((a, b) => a.date.localeCompare(b.date));
  sortedAtt.forEach(r => {
    if (!dateMap[r.date]) {
      dateMap[r.date] = { present: 0, absent: 0, halfDay: 0, onLeave: 0 };
    }
    if (r.status === 'Present') dateMap[r.date].present++;
    else if (r.status === 'Absent') dateMap[r.date].absent++;
    else if (r.status === 'Half-day') dateMap[r.date].halfDay++;
    else if (r.status === 'On Leave') dateMap[r.date].onLeave++;
  });

  const attendanceTrends = Object.entries(dateMap)
    .slice(-7)
    .map(([date, counts]) => ({
      date: date.slice(5), // MM-DD
      ...counts
    }));

  // Leave utilization
  const leaveTypeCount: Record<string, number> = { Paid: 0, Sick: 0, Casual: 0, Unpaid: 0 };
  db.leaveRequests.forEach(l => {
    if (leaveTypeCount[l.leaveType] !== undefined) {
      leaveTypeCount[l.leaveType] += l.daysCount;
    }
  });

  const totalLeaveDays = Object.values(leaveTypeCount).reduce((a, b) => a + b, 0) || 1;
  const leaveUtilization = Object.entries(leaveTypeCount).map(([type, count]) => ({
    type,
    count,
    percentage: Math.round((count / totalLeaveDays) * 100)
  }));

  // Gender / Diversity
  const genderMap: Record<string, number> = {};
  activeEmployees.forEach(e => {
    const g = e.gender || 'Not Disclosed';
    genderMap[g] = (genderMap[g] || 0) + 1;
  });

  const genderBreakdown = Object.entries(genderMap).map(([name, value]) => ({ name, value }));

  res.json({
    totalEmployees: totalEmps,
    presentToday,
    absentToday,
    onLeaveToday,
    attendanceRate,
    pendingLeaves,
    monthlyPayrollTotal,
    departmentBreakdown,
    attendanceTrends,
    leaveUtilization,
    genderBreakdown
  });
});

// --- Notification Routes ---
app.get('/api/notifications', authMiddleware, (req, res) => {
  const currentUser = (req as any).user;

  const list = db.notifications.filter(n =>
    !n.recipientEmployeeId ||
    n.recipientEmployeeId === currentUser.employeeId ||
    (n.roleTarget && (n.roleTarget === currentUser.role || (currentUser.role === 'admin' && n.roleTarget === 'hr')))
  );

  const unreadCount = list.filter(n => !n.isRead).length;

  res.json({
    unreadCount,
    notifications: list.slice(0, 50)
  });
});

app.put('/api/notifications/:id/read', authMiddleware, (req, res) => {
  const { id } = req.params;
  const notif = db.notifications.find(n => n.id === id);
  if (notif) {
    notif.isRead = true;
    saveDatabase();
  }
  res.json({ success: true });
});

app.put('/api/notifications/read-all', authMiddleware, (req, res) => {
  const currentUser = (req as any).user;
  db.notifications.forEach(n => {
    if (!n.recipientEmployeeId || n.recipientEmployeeId === currentUser.employeeId || n.roleTarget === currentUser.role) {
      n.isRead = true;
    }
  });
  saveDatabase();
  res.json({ success: true });
});

// --- Audit Logs ---
app.get('/api/audit-logs', authMiddleware, (req, res) => {
  const { search, targetEntity, limit = 100 } = req.query;

  let list = [...db.auditLogs];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(l =>
      (l.actorName || '').toLowerCase().includes(q) ||
      (l.action || '').toLowerCase().includes(q) ||
      (typeof l.details === 'string' ? l.details.toLowerCase() : JSON.stringify(l.details || '').toLowerCase()).includes(q) ||
      (l.targetId || '').toLowerCase().includes(q)
    );
  }

  if (targetEntity && targetEntity !== 'All') {
    list = list.filter(l => l.targetEntity === targetEntity);
  }

  res.json({
    total: list.length,
    logs: list.slice(0, Number(limit))
  });
});

// --- Documents Route ---
app.post('/api/documents/upload', authMiddleware, (req, res) => {
  const currentUser = (req as any).user;
  const { employeeId, title, category, fileSize = '1.2 MB' } = req.body;

  const targetEmpId = employeeId || currentUser.employeeId;
  const emp = db.employees.find(e => e.employeeId === targetEmpId);

  if (!emp) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  const newDoc = {
    id: 'doc_' + Date.now(),
    title: title || 'Uploaded Document',
    category: category || 'Contract',
    uploadDate: new Date().toISOString().split('T')[0],
    fileSize
  };

  if (!emp.documents) emp.documents = [];
  emp.documents.unshift(newDoc);

  logAudit(
    currentUser,
    'Document Uploaded',
    'Document',
    newDoc.id,
    `${currentUser.name} uploaded ${title} (${category}) for employee ${emp.name}.`
  );

  saveDatabase();
  res.status(201).json(newDoc);
});

// --- Vite Middleware Server Setup ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dayflow HRMS Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
