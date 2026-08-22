import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { db, initDb, hashPassword } from './database/db';
import {
  loginSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  applyLeaveSchema,
  checkInSchema
} from './server/validation';
import { ZodError } from 'zod';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dayflow-super-secret-key-2026';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

initDb();

function logAudit(actor: any, action: string, targetEntity: string, targetId: string, details: string, metadata?: any) {
  const auditId = 'audit_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const stmt = db.prepare(`
    INSERT INTO audit_logs (id, actorId, actorName, actorRole, action, targetEntity, targetId, details, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    auditId, actor.employeeId, actor.name, actor.role, action, targetEntity, targetId, details,
    metadata ? JSON.stringify(metadata) : null,
    new Date().toISOString()
  );
}

function sendNotification(data: { recipientEmployeeId?: string; roleTarget?: string; title: string; message: string; type: string; link?: string }) {
  const notifId = 'notif_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const stmt = db.prepare(`
    INSERT INTO notifications (id, recipientEmployeeId, roleTarget, title, message, type, isRead, timestamp, link)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
  `);
  stmt.run(
    notifId, data.recipientEmployeeId || null, data.roleTarget || null, data.title, data.message, data.type,
    new Date().toISOString(), data.link || null
  );
}

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; employeeId: string; role: string };
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId) as any;
    const employee = db.prepare('SELECT * FROM employees WHERE employeeId = ?').get(decoded.employeeId) as any;
    
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    if (employee) {
      employee.skills = employee.skills ? JSON.parse(employee.skills) : [];
      employee.emergencyContact = employee.emergencyContact ? JSON.parse(employee.emergencyContact) : undefined;
      employee.salary = employee.salary ? JSON.parse(employee.salary) : undefined;
      employee.documents = employee.documents ? JSON.parse(employee.documents) : [];
    }

    (req as any).user = user;
    (req as any).employee = employee;
    (req as any).token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid.' });
  }
}

function roleMiddleware(allowedRoles: string[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden.' });
    }
    next();
  };
}

// --- Auth Routes ---
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const employee = db.prepare('SELECT * FROM employees WHERE employeeId = ?').get(user.employeeId) as any;
    if (employee) {
      employee.skills = employee.skills ? JSON.parse(employee.skills) : [];
      employee.emergencyContact = employee.emergencyContact ? JSON.parse(employee.emergencyContact) : undefined;
      employee.salary = employee.salary ? JSON.parse(employee.salary) : undefined;
      employee.documents = employee.documents ? JSON.parse(employee.documents) : [];
    }

    const token = jwt.sign({ userId: user.id, employeeId: user.employeeId, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user, employee });
  } catch (err: any) {
    if (err instanceof ZodError) return res.status(400).json({ error: 'Validation error', details: (err as any).errors });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/demo-login', (req, res) => {
  const { employeeId } = req.body;
  if (!employeeId) return res.status(400).json({ error: 'employeeId required' });

  const user = db.prepare('SELECT * FROM users WHERE employeeId = ?').get(employeeId) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });

  const employee = db.prepare('SELECT * FROM employees WHERE employeeId = ?').get(user.employeeId) as any;
  if (employee) {
    employee.skills = employee.skills ? JSON.parse(employee.skills) : [];
    employee.emergencyContact = employee.emergencyContact ? JSON.parse(employee.emergencyContact) : undefined;
    employee.salary = employee.salary ? JSON.parse(employee.salary) : undefined;
    employee.documents = employee.documents ? JSON.parse(employee.documents) : [];
  }

  const token = jwt.sign({ userId: user.id, employeeId: user.employeeId, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user, employee });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: (req as any).user, employee: (req as any).employee });
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Registration disabled in this demo' });
});

// --- Employee Routes ---
app.get('/api/employees', authMiddleware, (req, res) => {
  let query = 'SELECT * FROM employees WHERE 1=1';
  const params: any[] = [];
  
  if (req.query.department) {
    query += ' AND department = ?';
    params.push(req.query.department);
  }
  if (req.query.search) {
    query += ' AND (name LIKE ? OR employeeId LIKE ? OR email LIKE ?)';
    const searchParam = `%${req.query.search}%`;
    params.push(searchParam, searchParam, searchParam);
  }
  
  const employees = db.prepare(query).all(...params) as any[];
  const formatted = employees.map(emp => ({
    ...emp,
    skills: emp.skills ? JSON.parse(emp.skills) : [],
    emergencyContact: emp.emergencyContact ? JSON.parse(emp.emergencyContact) : undefined,
    salary: emp.salary ? JSON.parse(emp.salary) : undefined,
    documents: emp.documents ? JSON.parse(emp.documents) : []
  }));

  res.json({ total: formatted.length, employees: formatted });
});

app.get('/api/employees/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const emp = db.prepare('SELECT * FROM employees WHERE employeeId = ? OR id = ?').get(id, id) as any;
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  emp.skills = emp.skills ? JSON.parse(emp.skills) : [];
  emp.emergencyContact = emp.emergencyContact ? JSON.parse(emp.emergencyContact) : undefined;
  emp.salary = emp.salary ? JSON.parse(emp.salary) : undefined;
  emp.documents = emp.documents ? JSON.parse(emp.documents) : [];
  res.json(emp);
});

app.post('/api/employees', authMiddleware, roleMiddleware(['admin', 'hr']), (req, res) => {
  try {
    const data = createEmployeeSchema.parse(req.body);
    const userId = 'user_' + Date.now();
    const empIdStr = 'emp_' + Date.now();
    
    const existUser = db.prepare('SELECT id FROM users WHERE email = ? OR employeeId = ?').get(data.email, data.employeeId);
    if (existUser) return res.status(400).json({ error: 'Email or Employee ID already exists' });

    db.transaction(() => {
      db.prepare(`
        INSERT INTO users (id, employeeId, name, email, passwordHash, role, isEmailVerified, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
      `).run(userId, data.employeeId, data.name, data.email, hashPassword('Dayflow123!'), data.role, new Date().toISOString());

      db.prepare(`
        INSERT INTO employees (id, userId, employeeId, name, email, role, phone, address, department, designation, joiningDate, employmentType, status, salary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?)
      `).run(empIdStr, userId, data.employeeId, data.name, data.email, data.role, data.phone, data.address, data.department, data.designation, data.joiningDate, data.employmentType, data.salary ? JSON.stringify(data.salary) : null);

      db.prepare(`INSERT INTO leave_balances (employeeId) VALUES (?)`).run(data.employeeId);
    })();

    logAudit((req as any).user, 'Employee Created', 'Employee', data.employeeId, `Created employee ${data.name} (${data.employeeId})`);
    res.json({ message: 'Employee created', employee: { id: empIdStr, ...data } });
  } catch (err: any) {
    if (err instanceof ZodError) return res.status(400).json({ error: 'Validation error', details: (err as any).errors });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/employees/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  try {
    const data = updateEmployeeSchema.parse(req.body);
    const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(id) as any;
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    
    const isSelf = (req as any).employee.id === id;
    const isAdminHr = ['admin', 'hr'].includes((req as any).user.role);
    if (!isSelf && !isAdminHr) return res.status(403).json({ error: 'Forbidden' });

    const updates = [];
    const params = [];
    
    if (data.phone) { updates.push('phone = ?'); params.push(data.phone); }
    if (data.address) { updates.push('address = ?'); params.push(data.address); }

    if (updates.length > 0) {
      params.push(id);
      db.prepare(`UPDATE employees SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }
    
    logAudit((req as any).user, 'Employee Updated', 'Employee', emp.employeeId, `Updated details for ${emp.name}`);
    const updated = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    res.json(updated);
  } catch (err: any) {
    if (err instanceof ZodError) return res.status(400).json({ error: 'Validation error', details: (err as any).errors });
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/employees/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const { id } = req.params;
  const emp = db.prepare('SELECT * FROM employees WHERE id = ?').get(id) as any;
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  
  db.prepare('DELETE FROM users WHERE id = ?').run(emp.userId);
  logAudit((req as any).user, 'Employee Deleted', 'Employee', emp.employeeId, `Deleted employee ${emp.name}`);
  res.json({ message: 'Employee deleted successfully' });
});

// --- Attendance Routes ---
app.get('/api/attendance', authMiddleware, (req, res) => {
  let query = 'SELECT * FROM attendance WHERE 1=1';
  const params: any[] = [];
  
  if (req.query.employeeId) {
    query += ' AND employeeId = ?';
    params.push(req.query.employeeId);
  }
  query += ' ORDER BY date DESC LIMIT 50';
  
  const records = db.prepare(query).all(...params);
  res.json({ total: records.length, records });
});

app.get('/api/attendance/today-summary', authMiddleware, (req, res) => {
  const userEmpId = (req as any).employee.employeeId;
  const today = new Date().toISOString().split('T')[0];
  
  const userRecord = db.prepare('SELECT * FROM attendance WHERE employeeId = ? AND date = ?').get(userEmpId, today) as any;
  const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM employees WHERE status = "Active"').get() as {count: number};
  const present = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = "Present"').get(today) as {count: number};
  
  res.json({
    date: today,
    userRecord: userRecord || null,
    isCheckedIn: !!(userRecord && userRecord.checkInTime && !userRecord.checkOutTime),
    isCheckedOut: !!(userRecord && userRecord.checkOutTime),
    stats: {
      totalEmployees: totalEmployees.count,
      present: present.count,
      absent: 0,
      onLeave: 0,
      halfDay: 0
    }
  });
});

app.post('/api/attendance/check-in', authMiddleware, (req, res) => {
  const userEmpId = (req as any).employee.employeeId;
  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });
  
  const existing = db.prepare('SELECT id FROM attendance WHERE employeeId = ? AND date = ?').get(userEmpId, today);
  if (existing) return res.status(400).json({ error: 'Already checked in today' });
  
  const data = checkInSchema.parse(req.body);
  const id = 'att_' + Date.now();
  
  db.prepare(`
    INSERT INTO attendance (id, employeeId, employeeName, department, date, checkInTime, status, checkInNote, location)
    VALUES (?, ?, ?, ?, ?, ?, 'Present', ?, ?)
  `).run(id, userEmpId, (req as any).user.name, (req as any).employee.department, today, nowTime, data.note || '', data.location || '');
  
  res.json({ message: 'Checked in successfully' });
});

app.post('/api/attendance/check-out', authMiddleware, (req, res) => {
  const userEmpId = (req as any).employee.employeeId;
  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });
  
  const existing = db.prepare('SELECT * FROM attendance WHERE employeeId = ? AND date = ?').get(userEmpId, today) as any;
  if (!existing) return res.status(400).json({ error: 'No check-in record found for today' });
  if (existing.checkOutTime) return res.status(400).json({ error: 'Already checked out today' });
  
  const duration = 480; 
  db.prepare(`UPDATE attendance SET checkOutTime = ?, durationMinutes = ? WHERE id = ?`).run(nowTime, duration, existing.id);
  res.json({ message: 'Checked out successfully' });
});

app.post('/api/attendance/manual-record', authMiddleware, roleMiddleware(['admin', 'hr']), (req, res) => {
  // Stub for manual attendance
  res.json({ message: 'Manual record created' });
});

// --- Leaves Routes ---
app.get('/api/leaves', authMiddleware, (req, res) => {
  let query = 'SELECT * FROM leave_requests WHERE 1=1';
  const params: any[] = [];
  
  if (req.query.employeeId) {
    query += ' AND employeeId = ?';
    params.push(req.query.employeeId);
  }
  query += ' ORDER BY appliedAt DESC';
  
  const leaves = db.prepare(query).all(...params);
  res.json({ total: leaves.length, leaves });
});

app.get('/api/leaves/balances/:employeeId', authMiddleware, (req, res) => {
  const balance = db.prepare('SELECT * FROM leave_balances WHERE employeeId = ?').get(req.params.employeeId);
  res.json(balance || { error: 'Not found' });
});

app.post('/api/leaves', authMiddleware, (req, res) => {
  try {
    const data = applyLeaveSchema.parse(req.body);
    const user = (req as any).user;
    const employee = (req as any).employee;
    const id = 'leave_' + Date.now();
    
    db.prepare(`
      INSERT INTO leave_requests (id, employeeId, employeeName, department, leaveType, startDate, endDate, daysCount, reason, status, appliedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, 'Pending', ?)
    `).run(id, user.employeeId, user.name, employee.department, data.leaveType, data.startDate, data.endDate, data.reason, new Date().toISOString());
    
    sendNotification({
      roleTarget: 'hr',
      title: 'New Leave Request',
      message: `${user.name} applied for ${data.leaveType} leave.`,
      type: 'leave'
    });
    
    logAudit(user, 'Leave Requested', 'Leave', id, `Requested ${data.leaveType} leave`);
    res.json({ message: 'Leave request submitted successfully' });
  } catch(err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/leaves/:id/review', authMiddleware, roleMiddleware(['admin', 'hr']), (req, res) => {
  const { status, adminRemarks } = req.body;
  const { id } = req.params;
  const leave = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(id) as any;
  if (!leave) return res.status(404).json({ error: 'Leave not found' });

  db.prepare('UPDATE leave_requests SET status = ?, adminRemarks = ?, reviewedBy = ?, reviewedAt = ? WHERE id = ?')
    .run(status, adminRemarks || null, (req as any).user.name, new Date().toISOString(), id);

  sendNotification({
    recipientEmployeeId: leave.employeeId,
    title: `Leave ${status}`,
    message: `Your ${leave.leaveType} leave request was ${status.toLowerCase()}.`,
    type: status === 'Approved' ? 'success' : 'error'
  });

  logAudit((req as any).user, `Leave ${status}`, 'Leave', id, `Reviewed leave request for ${leave.employeeName}`);
  res.json({ message: 'Leave reviewed successfully' });
});

// --- Payroll Routes ---
app.get('/api/payroll', authMiddleware, (req, res) => {
  let query = 'SELECT * FROM payslips WHERE 1=1';
  const params: any[] = [];
  
  if (req.query.employeeId) {
    query += ' AND employeeId = ?';
    params.push(req.query.employeeId);
  }
  
  const payslips = db.prepare(query).all(...params);
  let totalPayroll = 0;
  let totalBase = 0;
  let totalTaxes = 0;
  payslips.forEach((p: any) => {
    totalPayroll += p.netPay;
    totalBase += p.baseSalary;
    totalTaxes += p.taxDeductions;
  });

  res.json({
    totalCount: payslips.length,
    totalPayroll,
    totalBase,
    totalTaxes,
    payslips
  });
});

app.post('/api/payroll/generate-batch', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  res.json({ message: 'Batch generated', createdCount: 0 });
});

app.put('/api/payroll/salary-structure/:employeeId', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  res.json({ message: 'Salary structure updated' });
});

// --- Analytics Routes ---
app.get('/api/analytics', authMiddleware, (req, res) => {
  res.json({
    employees: { total: 0, newThisMonth: 0, turnoverRate: 0, byDepartment: [] },
    attendance: { averageDaily: 0, onTimeRate: 0, absentRate: 0, trends: [] },
    payroll: { totalMonthly: 0, ytdSpend: 0, byDepartment: [] },
    leaves: { totalPending: 0, approvedThisMonth: 0, upcoming: [] }
  });
});

// --- Notifications Routes ---
app.get('/api/notifications', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const notifications = db.prepare('SELECT * FROM notifications WHERE recipientEmployeeId = ? OR roleTarget = ? ORDER BY timestamp DESC LIMIT 50')
    .all(user.employeeId, user.role);
  
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  res.json({ unreadCount, notifications });
});

app.put('/api/notifications/:id/read', authMiddleware, (req, res) => {
  db.prepare('UPDATE notifications SET isRead = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.put('/api/notifications/read-all', authMiddleware, (req, res) => {
  const user = (req as any).user;
  db.prepare('UPDATE notifications SET isRead = 1 WHERE recipientEmployeeId = ? OR roleTarget = ?')
    .run(user.employeeId, user.role);
  res.json({ success: true });
});

// --- Audit Logs Routes ---
app.get('/api/audit-logs', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100').all();
  res.json({ total: logs.length, logs });
});

// --- Documents Routes ---
app.post('/api/documents/upload', authMiddleware, (req, res) => {
  res.json({ message: 'Document uploaded' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist/client')));
    app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist/client/index.html')));
  }

  app.listen(PORT, () => {
    console.log(`[Dayflow] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
