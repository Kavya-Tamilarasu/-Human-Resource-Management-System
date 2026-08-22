import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'dayflow.db');

export const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL'); // Better performance

// Password hashing utility using native crypto PBKDF2
export function hashPassword(password: string, salt: string = 'dayflow_salt_2026'): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      employeeId TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL,
      isEmailVerified INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      employeeId TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT,
      phone TEXT,
      address TEXT,
      department TEXT,
      designation TEXT,
      joiningDate TEXT,
      employmentType TEXT,
      managerName TEXT,
      status TEXT,
      dob TEXT,
      gender TEXT,
      skills TEXT, -- JSON string
      emergencyContact TEXT, -- JSON string
      salary TEXT, -- JSON string
      documents TEXT, -- JSON string
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      employeeName TEXT NOT NULL,
      department TEXT NOT NULL,
      date TEXT NOT NULL,
      checkInTime TEXT,
      checkOutTime TEXT,
      durationMinutes INTEGER,
      status TEXT NOT NULL,
      checkInNote TEXT,
      ipAddress TEXT,
      location TEXT,
      FOREIGN KEY(employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS leave_balances (
      employeeId TEXT PRIMARY KEY,
      paidTotal INTEGER DEFAULT 24,
      paidUsed INTEGER DEFAULT 0,
      sickTotal INTEGER DEFAULT 12,
      sickUsed INTEGER DEFAULT 0,
      casualTotal INTEGER DEFAULT 6,
      casualUsed INTEGER DEFAULT 0,
      unpaidUsed INTEGER DEFAULT 0,
      FOREIGN KEY(employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS leave_requests (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      employeeName TEXT NOT NULL,
      department TEXT NOT NULL,
      leaveType TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      daysCount INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL,
      appliedAt TEXT NOT NULL,
      reviewedBy TEXT,
      reviewedAt TEXT,
      adminRemarks TEXT,
      FOREIGN KEY(employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payslips (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      employeeName TEXT NOT NULL,
      department TEXT NOT NULL,
      designation TEXT NOT NULL,
      month TEXT NOT NULL,
      year INTEGER NOT NULL,
      baseSalary REAL NOT NULL,
      hra REAL NOT NULL,
      allowances REAL NOT NULL,
      bonuses REAL NOT NULL,
      taxDeductions REAL NOT NULL,
      pfDeductions REAL NOT NULL,
      netPay REAL NOT NULL,
      status TEXT NOT NULL,
      paymentDate TEXT,
      transactionId TEXT,
      FOREIGN KEY(employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      recipientEmployeeId TEXT,
      roleTarget TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      timestamp TEXT NOT NULL,
      link TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actorId TEXT NOT NULL,
      actorName TEXT NOT NULL,
      actorRole TEXT NOT NULL,
      action TEXT NOT NULL,
      targetEntity TEXT NOT NULL,
      targetId TEXT NOT NULL,
      details TEXT NOT NULL,
      metadata TEXT, -- JSON string
      timestamp TEXT NOT NULL
    );
  `);

  // Check if seed needed
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  const insertUser = db.prepare(`
    INSERT INTO users (id, employeeId, name, email, passwordHash, role, isEmailVerified, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertEmployee = db.prepare(`
    INSERT INTO employees (id, userId, employeeId, name, email, role, avatar, phone, address, department, designation, joiningDate, employmentType, managerName, status, salary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertLeaveBalance = db.prepare(`
    INSERT INTO leave_balances (employeeId, paidTotal, paidUsed, sickTotal, sickUsed, casualTotal, casualUsed, unpaidUsed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, actorId, actorName, actorRole, action, targetEntity, targetId, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const defaultPasswordHash = hashPassword('Password123!');
  const now = new Date().toISOString();

  // Admin User
  const adminEmpId = 'EMP001';
  const adminId = 'emp_001';
  const adminUserId = 'user_001';
  
  insertUser.run(
    adminUserId, adminEmpId, 'Elena Vance', 'elena.vance@dayflow.io',
    defaultPasswordHash, 'admin', 1, now
  );

  const salaryData = JSON.stringify({
    baseSalary: 14500, hra: 3500, allowances: 2000, taxDeduction: 3200, netSalary: 17500,
    bankAccount: '•••• 4491'
  });

  insertEmployee.run(
    adminId, adminUserId, adminEmpId, 'Elena Vance', 'elena.vance@dayflow.io',
    'admin', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    '+1 (555) 234-5678', '742 Evergreen Terrace', 'Human Resources', 'VP of People & Culture',
    '2022-01-15', 'Full-time', 'Board of Directors', 'Active', salaryData
  );

  insertLeaveBalance.run(adminEmpId, 24, 0, 12, 0, 6, 0, 0);

  // Employee User
  const empId2 = 'EMP002';
  const empIdStr2 = 'emp_002';
  const empUserId2 = 'user_002';

  insertUser.run(
    empUserId2, empId2, 'Marcus Chen', 'marcus.chen@dayflow.io',
    defaultPasswordHash, 'employee', 1, now
  );

  const salaryData2 = JSON.stringify({
    baseSalary: 13000, hra: 3000, allowances: 1500, taxDeduction: 2800, netSalary: 15200,
    bankAccount: '•••• 8823'
  });

  insertEmployee.run(
    empIdStr2, empUserId2, empId2, 'Marcus Chen', 'marcus.chen@dayflow.io',
    'employee', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    '+1 (555) 345-6789', '1204 Market Street', 'Engineering', 'Staff Software Engineer',
    '2022-06-01', 'Full-time', 'Alex Rivera', 'Active', salaryData2
  );

  insertLeaveBalance.run(empId2, 24, 4, 12, 1, 6, 0, 0);

  insertAudit.run(
    'audit_init', adminEmpId, 'Elena Vance', 'admin', 'System Seed Initialized',
    'System', 'DAYFLOW_ROOT', 'Bootstrapped local SQLite db with seed data', now
  );

  console.log('SQLite database seeded successfully.');
}
