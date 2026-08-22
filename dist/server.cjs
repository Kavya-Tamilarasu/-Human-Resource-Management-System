var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_vite = require("vite");

// database/db.ts
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var DATA_DIR = import_path.default.join(process.cwd(), "data");
if (!import_fs.default.existsSync(DATA_DIR)) {
  import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
}
var DB_FILE = import_path.default.join(DATA_DIR, "dayflow.db");
var db = new import_better_sqlite3.default(DB_FILE);
db.pragma("journal_mode = WAL");
function hashPassword(password, salt = "dayflow_salt_2026") {
  return import_crypto.default.pbkdf2Sync(password, salt, 1e3, 64, "sha512").toString("hex");
}
function initDb() {
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
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
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
  const defaultPasswordHash = hashPassword("Password123!");
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const adminEmpId = "EMP001";
  const adminId = "emp_001";
  const adminUserId = "user_001";
  insertUser.run(
    adminUserId,
    adminEmpId,
    "Elena Vance",
    "elena.vance@dayflow.io",
    defaultPasswordHash,
    "admin",
    1,
    now
  );
  const salaryData = JSON.stringify({
    baseSalary: 14500,
    hra: 3500,
    allowances: 2e3,
    taxDeduction: 3200,
    netSalary: 17500,
    bankAccount: "\u2022\u2022\u2022\u2022 4491"
  });
  insertEmployee.run(
    adminId,
    adminUserId,
    adminEmpId,
    "Elena Vance",
    "elena.vance@dayflow.io",
    "admin",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    "+1 (555) 234-5678",
    "742 Evergreen Terrace",
    "Human Resources",
    "VP of People & Culture",
    "2022-01-15",
    "Full-time",
    "Board of Directors",
    "Active",
    salaryData
  );
  insertLeaveBalance.run(adminEmpId, 24, 0, 12, 0, 6, 0, 0);
  const empId2 = "EMP002";
  const empIdStr2 = "emp_002";
  const empUserId2 = "user_002";
  insertUser.run(
    empUserId2,
    empId2,
    "Marcus Chen",
    "marcus.chen@dayflow.io",
    defaultPasswordHash,
    "employee",
    1,
    now
  );
  const salaryData2 = JSON.stringify({
    baseSalary: 13e3,
    hra: 3e3,
    allowances: 1500,
    taxDeduction: 2800,
    netSalary: 15200,
    bankAccount: "\u2022\u2022\u2022\u2022 8823"
  });
  insertEmployee.run(
    empIdStr2,
    empUserId2,
    empId2,
    "Marcus Chen",
    "marcus.chen@dayflow.io",
    "employee",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "+1 (555) 345-6789",
    "1204 Market Street",
    "Engineering",
    "Staff Software Engineer",
    "2022-06-01",
    "Full-time",
    "Alex Rivera",
    "Active",
    salaryData2
  );
  insertLeaveBalance.run(empId2, 24, 4, 12, 1, 6, 0, 0);
  insertAudit.run(
    "audit_init",
    adminEmpId,
    "Elena Vance",
    "admin",
    "System Seed Initialized",
    "System",
    "DAYFLOW_ROOT",
    "Bootstrapped local SQLite db with seed data",
    now
  );
  console.log("SQLite database seeded successfully.");
}

// server/validation.ts
var import_zod = require("zod");
var loginSchema = import_zod.z.object({
  email: import_zod.z.string().email(),
  password: import_zod.z.string().min(6)
});
var createEmployeeSchema = import_zod.z.object({
  employeeId: import_zod.z.string().min(1),
  name: import_zod.z.string().min(2),
  email: import_zod.z.string().email(),
  role: import_zod.z.enum(["admin", "hr", "employee"]),
  department: import_zod.z.string().min(2),
  designation: import_zod.z.string().min(2),
  employmentType: import_zod.z.string(),
  joiningDate: import_zod.z.string(),
  phone: import_zod.z.string(),
  address: import_zod.z.string(),
  salary: import_zod.z.object({
    basicSalary: import_zod.z.number().optional(),
    baseSalary: import_zod.z.number().optional(),
    hra: import_zod.z.number(),
    allowances: import_zod.z.number(),
    bonus: import_zod.z.number().optional(),
    deductions: import_zod.z.number().optional(),
    taxDeduction: import_zod.z.number(),
    netSalary: import_zod.z.number(),
    bankAccount: import_zod.z.string().optional()
  }).optional()
});
var updateEmployeeSchema = createEmployeeSchema.partial();
var applyLeaveSchema = import_zod.z.object({
  leaveType: import_zod.z.string(),
  startDate: import_zod.z.string(),
  endDate: import_zod.z.string(),
  reason: import_zod.z.string().min(5)
});
var checkInSchema = import_zod.z.object({
  location: import_zod.z.string().optional(),
  note: import_zod.z.string().optional()
});

// server.ts
var import_zod2 = require("zod");
var app = (0, import_express.default)();
var PORT = 3e3;
var JWT_SECRET = process.env.JWT_SECRET || "dayflow-super-secret-key-2026";
app.use(import_express.default.json({ limit: "10mb" }));
app.use(import_express.default.urlencoded({ extended: true }));
initDb();
function logAudit(actor, action, targetEntity, targetId, details, metadata) {
  const auditId = "audit_" + Date.now() + "_" + Math.floor(Math.random() * 1e3);
  const stmt = db.prepare(`
    INSERT INTO audit_logs (id, actorId, actorName, actorRole, action, targetEntity, targetId, details, metadata, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    auditId,
    actor.employeeId,
    actor.name,
    actor.role,
    action,
    targetEntity,
    targetId,
    details,
    metadata ? JSON.stringify(metadata) : null,
    (/* @__PURE__ */ new Date()).toISOString()
  );
}
function sendNotification(data) {
  const notifId = "notif_" + Date.now() + "_" + Math.floor(Math.random() * 1e3);
  const stmt = db.prepare(`
    INSERT INTO notifications (id, recipientEmployeeId, roleTarget, title, message, type, isRead, timestamp, link)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
  `);
  stmt.run(
    notifId,
    data.recipientEmployeeId || null,
    data.roleTarget || null,
    data.title,
    data.message,
    data.type,
    (/* @__PURE__ */ new Date()).toISOString(),
    data.link || null
  );
}
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authentication required." });
  }
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(decoded.userId);
    const employee = db.prepare("SELECT * FROM employees WHERE employeeId = ?").get(decoded.employeeId);
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }
    if (employee) {
      employee.skills = employee.skills ? JSON.parse(employee.skills) : [];
      employee.emergencyContact = employee.emergencyContact ? JSON.parse(employee.emergencyContact) : void 0;
      employee.salary = employee.salary ? JSON.parse(employee.salary) : void 0;
      employee.documents = employee.documents ? JSON.parse(employee.documents) : [];
    }
    req.user = user;
    req.employee = employee;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired or invalid." });
  }
}
function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden." });
    }
    next();
  };
}
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const employee = db.prepare("SELECT * FROM employees WHERE employeeId = ?").get(user.employeeId);
    if (employee) {
      employee.skills = employee.skills ? JSON.parse(employee.skills) : [];
      employee.emergencyContact = employee.emergencyContact ? JSON.parse(employee.emergencyContact) : void 0;
      employee.salary = employee.salary ? JSON.parse(employee.salary) : void 0;
      employee.documents = employee.documents ? JSON.parse(employee.documents) : [];
    }
    const token = import_jsonwebtoken.default.sign({ userId: user.id, employeeId: user.employeeId, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, user, employee });
  } catch (err) {
    if (err instanceof import_zod2.ZodError) return res.status(400).json({ error: "Validation error", details: err.errors });
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/api/auth/demo-login", (req, res) => {
  const { employeeId } = req.body;
  if (!employeeId) return res.status(400).json({ error: "employeeId required" });
  const user = db.prepare("SELECT * FROM users WHERE employeeId = ?").get(employeeId);
  if (!user) return res.status(404).json({ error: "User not found" });
  const employee = db.prepare("SELECT * FROM employees WHERE employeeId = ?").get(user.employeeId);
  if (employee) {
    employee.skills = employee.skills ? JSON.parse(employee.skills) : [];
    employee.emergencyContact = employee.emergencyContact ? JSON.parse(employee.emergencyContact) : void 0;
    employee.salary = employee.salary ? JSON.parse(employee.salary) : void 0;
    employee.documents = employee.documents ? JSON.parse(employee.documents) : [];
  }
  const token = import_jsonwebtoken.default.sign({ userId: user.id, employeeId: user.employeeId, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token, user, employee });
});
app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({ user: req.user, employee: req.employee });
});
app.post("/api/auth/logout", authMiddleware, (req, res) => {
  res.json({ message: "Logged out successfully" });
});
app.post("/api/auth/register", (req, res) => {
  res.json({ message: "Registration disabled in this demo" });
});
app.get("/api/employees", authMiddleware, (req, res) => {
  let query = "SELECT * FROM employees WHERE 1=1";
  const params = [];
  if (req.query.department) {
    query += " AND department = ?";
    params.push(req.query.department);
  }
  if (req.query.status) {
    query += " AND status = ?";
    params.push(req.query.status);
  }
  if (req.query.employmentType) {
    query += " AND employmentType = ?";
    params.push(req.query.employmentType);
  }
  if (req.query.search) {
    query += " AND (name LIKE ? OR employeeId LIKE ? OR email LIKE ?)";
    const searchParam = `%${req.query.search}%`;
    params.push(searchParam, searchParam, searchParam);
  }
  const employees = db.prepare(query).all(...params);
  const formatted = employees.map((emp) => ({
    ...emp,
    skills: emp.skills ? JSON.parse(emp.skills) : [],
    emergencyContact: emp.emergencyContact ? JSON.parse(emp.emergencyContact) : void 0,
    salary: emp.salary ? JSON.parse(emp.salary) : void 0,
    documents: emp.documents ? JSON.parse(emp.documents) : []
  }));
  res.json({ total: formatted.length, employees: formatted });
});
app.get("/api/employees/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const emp = db.prepare("SELECT * FROM employees WHERE employeeId = ? OR id = ?").get(id, id);
  if (!emp) return res.status(404).json({ error: "Employee not found" });
  emp.skills = emp.skills ? JSON.parse(emp.skills) : [];
  emp.emergencyContact = emp.emergencyContact ? JSON.parse(emp.emergencyContact) : void 0;
  emp.salary = emp.salary ? JSON.parse(emp.salary) : void 0;
  emp.documents = emp.documents ? JSON.parse(emp.documents) : [];
  res.json(emp);
});
app.post("/api/employees", authMiddleware, roleMiddleware(["admin", "hr"]), (req, res) => {
  try {
    const data = createEmployeeSchema.parse(req.body);
    const userId = "user_" + Date.now();
    const empIdStr = "emp_" + Date.now();
    const existUser = db.prepare("SELECT id FROM users WHERE email = ? OR employeeId = ?").get(data.email, data.employeeId);
    if (existUser) return res.status(400).json({ error: "Email or Employee ID already exists" });
    db.transaction(() => {
      db.prepare(`
        INSERT INTO users (id, employeeId, name, email, passwordHash, role, isEmailVerified, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
      `).run(userId, data.employeeId, data.name, data.email, hashPassword("Dayflow123!"), data.role, (/* @__PURE__ */ new Date()).toISOString());
      db.prepare(`
        INSERT INTO employees (id, userId, employeeId, name, email, role, phone, address, department, designation, joiningDate, employmentType, status, salary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?)
      `).run(empIdStr, userId, data.employeeId, data.name, data.email, data.role, data.phone, data.address, data.department, data.designation, data.joiningDate, data.employmentType, data.salary ? JSON.stringify(data.salary) : null);
      db.prepare(`INSERT INTO leave_balances (employeeId) VALUES (?)`).run(data.employeeId);
    })();
    logAudit(req.user, "Employee Created", "Employee", data.employeeId, `Created employee ${data.name} (${data.employeeId})`);
    res.json({ message: "Employee created", employee: { id: empIdStr, ...data } });
  } catch (err) {
    if (err instanceof import_zod2.ZodError) return res.status(400).json({ error: "Validation error", details: err.errors });
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/employees/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  try {
    const data = updateEmployeeSchema.parse(req.body);
    const emp = db.prepare("SELECT * FROM employees WHERE id = ?").get(id);
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    const isSelf = req.employee.id === id;
    const isAdminHr = ["admin", "hr"].includes(req.user.role);
    if (!isSelf && !isAdminHr) return res.status(403).json({ error: "Forbidden" });
    const updates = [];
    const params = [];
    if (data.phone) {
      updates.push("phone = ?");
      params.push(data.phone);
    }
    if (data.address) {
      updates.push("address = ?");
      params.push(data.address);
    }
    if (updates.length > 0) {
      params.push(id);
      db.prepare(`UPDATE employees SET ${updates.join(", ")} WHERE id = ?`).run(...params);
    }
    logAudit(req.user, "Employee Updated", "Employee", emp.employeeId, `Updated details for ${emp.name}`);
    const updated = db.prepare("SELECT * FROM employees WHERE id = ?").get(id);
    res.json(updated);
  } catch (err) {
    if (err instanceof import_zod2.ZodError) return res.status(400).json({ error: "Validation error", details: err.errors });
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/employees/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  const { id } = req.params;
  const emp = db.prepare("SELECT * FROM employees WHERE id = ?").get(id);
  if (!emp) return res.status(404).json({ error: "Employee not found" });
  db.prepare("DELETE FROM users WHERE id = ?").run(emp.userId);
  logAudit(req.user, "Employee Deleted", "Employee", emp.employeeId, `Deleted employee ${emp.name}`);
  res.json({ message: "Employee deleted successfully" });
});
app.get("/api/attendance", authMiddleware, (req, res) => {
  let query = "SELECT * FROM attendance WHERE 1=1";
  const params = [];
  if (req.query.employeeId) {
    query += " AND employeeId = ?";
    params.push(req.query.employeeId);
  }
  query += " ORDER BY date DESC LIMIT 50";
  const records = db.prepare(query).all(...params);
  res.json({ total: records.length, records });
});
app.get("/api/attendance/today-summary", authMiddleware, (req, res) => {
  const userEmpId = req.employee.employeeId;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const userRecord = db.prepare("SELECT * FROM attendance WHERE employeeId = ? AND date = ?").get(userEmpId, today);
  const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM employees WHERE status = "Active"').get();
  const present = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = "Present"').get(today);
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
app.post("/api/attendance/check-in", authMiddleware, (req, res) => {
  const userEmpId = req.employee.employeeId;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const nowTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", { hour12: false });
  const existing = db.prepare("SELECT id FROM attendance WHERE employeeId = ? AND date = ?").get(userEmpId, today);
  if (existing) return res.status(400).json({ error: "Already checked in today" });
  const data = checkInSchema.parse(req.body);
  const id = "att_" + Date.now();
  db.prepare(`
    INSERT INTO attendance (id, employeeId, employeeName, department, date, checkInTime, status, checkInNote, location)
    VALUES (?, ?, ?, ?, ?, ?, 'Present', ?, ?)
  `).run(id, userEmpId, req.user.name, req.employee.department, today, nowTime, data.note || "", data.location || "");
  res.json({ message: "Checked in successfully" });
});
app.post("/api/attendance/check-out", authMiddleware, (req, res) => {
  const userEmpId = req.employee.employeeId;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const nowTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", { hour12: false });
  const existing = db.prepare("SELECT * FROM attendance WHERE employeeId = ? AND date = ?").get(userEmpId, today);
  if (!existing) return res.status(400).json({ error: "No check-in record found for today" });
  if (existing.checkOutTime) return res.status(400).json({ error: "Already checked out today" });
  const duration = 480;
  db.prepare(`UPDATE attendance SET checkOutTime = ?, durationMinutes = ? WHERE id = ?`).run(nowTime, duration, existing.id);
  res.json({ message: "Checked out successfully" });
});
app.post("/api/attendance/manual-record", authMiddleware, roleMiddleware(["admin", "hr"]), (req, res) => {
  res.json({ message: "Manual record created" });
});
app.get("/api/leaves", authMiddleware, (req, res) => {
  let query = "SELECT * FROM leave_requests WHERE 1=1";
  const params = [];
  if (req.query.employeeId) {
    query += " AND employeeId = ?";
    params.push(req.query.employeeId);
  }
  query += " ORDER BY appliedAt DESC";
  const leaves = db.prepare(query).all(...params);
  res.json({ total: leaves.length, leaves });
});
app.get("/api/leaves/balances/:employeeId", authMiddleware, (req, res) => {
  const balance = db.prepare("SELECT * FROM leave_balances WHERE employeeId = ?").get(req.params.employeeId);
  res.json(balance || { error: "Not found" });
});
app.post("/api/leaves", authMiddleware, (req, res) => {
  try {
    const data = applyLeaveSchema.parse(req.body);
    const user = req.user;
    const employee = req.employee;
    const overlapping = db.prepare(`
      SELECT * FROM leave_requests 
      WHERE employeeId = ? AND status != 'Rejected'
      AND (
        (startDate <= ? AND endDate >= ?) OR
        (startDate <= ? AND endDate >= ?) OR
        (startDate >= ? AND endDate <= ?)
      )
    `).all(user.employeeId, data.endDate, data.startDate, data.startDate, data.startDate, data.startDate, data.endDate);
    if (overlapping && overlapping.length > 0) {
      return res.status(400).json({ error: "Leave request overlaps with an existing pending or approved leave." });
    }
    const id = "leave_" + Date.now();
    db.prepare(`
      INSERT INTO leave_requests (id, employeeId, employeeName, department, leaveType, startDate, endDate, daysCount, reason, status, appliedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, 'Pending', ?)
    `).run(id, user.employeeId, user.name, employee.department, data.leaveType, data.startDate, data.endDate, data.reason, (/* @__PURE__ */ new Date()).toISOString());
    sendNotification({
      roleTarget: "hr",
      title: "New Leave Request",
      message: `${user.name} applied for ${data.leaveType} leave.`,
      type: "leave"
    });
    logAudit(user, "Leave Requested", "Leave", id, `Requested ${data.leaveType} leave`);
    res.json({ message: "Leave request submitted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.put("/api/leaves/:id/review", authMiddleware, roleMiddleware(["admin", "hr"]), (req, res) => {
  const { status, adminRemarks } = req.body;
  const { id } = req.params;
  const leave = db.prepare("SELECT * FROM leave_requests WHERE id = ?").get(id);
  if (!leave) return res.status(404).json({ error: "Leave not found" });
  db.prepare("UPDATE leave_requests SET status = ?, adminRemarks = ?, reviewedBy = ?, reviewedAt = ? WHERE id = ?").run(status, adminRemarks || null, req.user.name, (/* @__PURE__ */ new Date()).toISOString(), id);
  sendNotification({
    recipientEmployeeId: leave.employeeId,
    title: `Leave ${status}`,
    message: `Your ${leave.leaveType} leave request was ${status.toLowerCase()}.`,
    type: status === "Approved" ? "success" : "error"
  });
  logAudit(req.user, `Leave ${status}`, "Leave", id, `Reviewed leave request for ${leave.employeeName}`);
  res.json({ message: "Leave reviewed successfully" });
});
app.get("/api/payroll", authMiddleware, (req, res) => {
  let query = "SELECT * FROM payslips WHERE 1=1";
  const params = [];
  if (req.query.employeeId) {
    query += " AND employeeId = ?";
    params.push(req.query.employeeId);
  }
  const payslips = db.prepare(query).all(...params);
  let totalPayroll = 0;
  let totalBase = 0;
  let totalTaxes = 0;
  payslips.forEach((p) => {
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
app.post("/api/payroll/generate-batch", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  res.json({ message: "Batch generated", createdCount: 0 });
});
app.put("/api/payroll/salary-structure/:employeeId", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  res.json({ message: "Salary structure updated" });
});
app.get("/api/analytics", authMiddleware, (req, res) => {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const thisMonth = (/* @__PURE__ */ new Date()).toLocaleString("en-US", { month: "long", year: "numeric" });
  const employeesCount = db.prepare("SELECT COUNT(*) as c FROM employees").get();
  const totalEmployees = employeesCount.c;
  const attendanceRows = db.prepare("SELECT status, COUNT(*) as c FROM attendance WHERE date = ? GROUP BY status").all(today);
  let presentToday = 0;
  let absentToday = 0;
  let onLeaveToday = 0;
  attendanceRows.forEach((r) => {
    if (r.status === "Present") presentToday = r.c;
    if (r.status === "Absent") absentToday = r.c;
    if (r.status === "On Leave") onLeaveToday = r.c;
  });
  const attendanceRate = totalEmployees > 0 ? Math.round(presentToday / totalEmployees * 100) : 0;
  const pendingLeavesRow = db.prepare("SELECT COUNT(*) as c FROM leave_requests WHERE status = ?").get("Pending");
  const pendingLeaves = pendingLeavesRow.c;
  const payrollRow = db.prepare("SELECT SUM(netSalary) as total FROM payslips WHERE month = ?").get(thisMonth);
  const monthlyPayrollTotal = payrollRow.total || 0;
  const deptBreakdown = db.prepare(`
    SELECT department, COUNT(*) as count, SUM(salary_basicSalary + salary_hra + salary_allowances) as budget 
    FROM employees 
    GROUP BY department
  `).all();
  const attendanceTrends = db.prepare(`
    SELECT date, 
      SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN status='Absent' THEN 1 ELSE 0 END) as absent,
      SUM(CASE WHEN status='Half-day' THEN 1 ELSE 0 END) as halfDay,
      SUM(CASE WHEN status='On Leave' THEN 1 ELSE 0 END) as onLeave
    FROM attendance 
    GROUP BY date 
    ORDER BY date DESC LIMIT 7
  `).all();
  res.json({
    totalEmployees,
    presentToday,
    absentToday,
    onLeaveToday,
    attendanceRate,
    pendingLeaves,
    monthlyPayrollTotal,
    departmentBreakdown: deptBreakdown,
    attendanceTrends: attendanceTrends.reverse(),
    leaveUtilization: [],
    genderBreakdown: []
  });
});
app.get("/api/notifications", authMiddleware, (req, res) => {
  const user = req.user;
  const notifications = db.prepare("SELECT * FROM notifications WHERE recipientEmployeeId = ? OR roleTarget = ? ORDER BY timestamp DESC LIMIT 50").all(user.employeeId, user.role);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  res.json({ unreadCount, notifications });
});
app.put("/api/notifications/:id/read", authMiddleware, (req, res) => {
  db.prepare("UPDATE notifications SET isRead = 1 WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});
app.put("/api/notifications/read-all", authMiddleware, (req, res) => {
  const user = req.user;
  db.prepare("UPDATE notifications SET isRead = 1 WHERE recipientEmployeeId = ? OR roleTarget = ?").run(user.employeeId, user.role);
  res.json({ success: true });
});
app.get("/api/audit-logs", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  const logs = db.prepare("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100").all();
  res.json({ total: logs.length, logs });
});
app.post("/api/documents/upload", authMiddleware, (req, res) => {
  res.json({ message: "Document uploaded" });
});
app.post("/api/chat", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user;
    const employee = req.employee;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "AI service is currently unavailable (Missing API Key)." });
    }
    const ai = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const intentSchema = {
      type: import_genai.Type.OBJECT,
      properties: {
        intent: {
          type: import_genai.Type.STRING,
          description: "The identified intent of the user. Must be one of: MY_ATTENDANCE, MY_LEAVE_BALANCE, LEAVE_REQUESTS, MY_PAYSLIP, EMPLOYEE_COUNT, EMPLOYEE_SEARCH, ANALYTICS, UNKNOWN",
          enum: ["MY_ATTENDANCE", "MY_LEAVE_BALANCE", "LEAVE_REQUESTS", "MY_PAYSLIP", "EMPLOYEE_COUNT", "EMPLOYEE_SEARCH", "ANALYTICS", "UNKNOWN"]
        },
        confidence: {
          type: import_genai.Type.NUMBER,
          description: "Confidence score between 0.0 and 1.0"
        }
      },
      required: ["intent", "confidence"]
    };
    const prompt = `
      You are an HR intent classifier.
      User message: "${message}"
      Classify the intent based on these rules:
      - Asking about their own attendance -> MY_ATTENDANCE
      - Asking about their leave balance -> MY_LEAVE_BALANCE
      - Asking about their leave requests -> LEAVE_REQUESTS
      - Asking about their payslip -> MY_PAYSLIP
      - Asking how many employees exist -> EMPLOYEE_COUNT
      - Asking to find an employee or show employees -> EMPLOYEE_SEARCH
      - Asking for HR analytics/stats -> ANALYTICS
      - Anything else -> UNKNOWN
      Return ONLY valid JSON matching the schema.
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: intentSchema,
        temperature: 0.1
      }
    });
    const result = JSON.parse(response.text || "{}");
    const intent = result.intent;
    let answer = "I'm sorry, I couldn't understand your request or don't have that information.";
    let actionType = void 0;
    if (intent === "MY_ATTENDANCE") {
      const records = db.prepare("SELECT * FROM attendance WHERE employeeId = ? ORDER BY date DESC LIMIT 30").all(user.employeeId);
      const present = records.filter((r) => r.status === "Present").length;
      const absent = records.filter((r) => r.status === "Absent").length;
      answer = `You have been present for **${present} days** and absent for **${absent} days** in your recent records.`;
      actionType = "attendance";
    } else if (intent === "MY_LEAVE_BALANCE") {
      const balance = db.prepare("SELECT * FROM leave_balances WHERE employeeId = ?").get(user.employeeId);
      if (balance) {
        const remaining = balance.paidTotal - balance.paidUsed;
        answer = `You have **${remaining} paid leave days** remaining (out of ${balance.paidTotal}).`;
      } else {
        answer = "I couldn't find your leave balance records.";
      }
      actionType = "leaves";
    } else if (intent === "LEAVE_REQUESTS") {
      const leaves = db.prepare("SELECT * FROM leave_requests WHERE employeeId = ? ORDER BY appliedAt DESC LIMIT 3").all(user.employeeId);
      if (leaves.length > 0) {
        answer = "Here are your recent leave requests:\n" + leaves.map((l) => `- ${l.startDate} to ${l.endDate}: **${l.status}**`).join("\n");
      } else {
        answer = "You have no recent leave requests.";
      }
      actionType = "leaves";
    } else if (intent === "MY_PAYSLIP") {
      const slip = db.prepare("SELECT * FROM payslips WHERE employeeId = ? ORDER BY month DESC LIMIT 1").get(user.employeeId);
      if (slip) {
        answer = `Your latest payslip is for **${slip.month}**. Net pay: **$${slip.netSalary.toLocaleString()}**.`;
      } else {
        answer = "I couldn't find any recent payslips for you.";
      }
      actionType = "payroll";
    } else if (intent === "EMPLOYEE_COUNT") {
      if (user.role === "admin" || user.role === "hr") {
        const count = db.prepare("SELECT COUNT(*) as c FROM employees").get();
        answer = `There are currently **${count.c} employees** in the organization.`;
      } else {
        answer = "I'm sorry, you don't have permission to access organization-wide employee statistics.";
      }
      actionType = "employees";
    } else if (intent === "ANALYTICS") {
      if (user.role === "admin" || user.role === "hr") {
        answer = "I can help you view detailed analytics. Please visit the Analytics dashboard for interactive charts on attendance, payroll, and employee distribution.";
      } else {
        answer = "I'm sorry, you don't have permission to access HR analytics.";
      }
      actionType = "analytics";
    } else if (intent === "UNKNOWN") {
      answer = "I can help you with attendance, leaves, payroll, and basic HR information. Could you rephrase your question?";
    }
    res.json({ answer, actionType });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Failed to process chat request." });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(import_express.default.static(import_path2.default.join(__dirname, "dist/client")));
    app.get("*", (req, res) => res.sendFile(import_path2.default.join(__dirname, "dist/client/index.html")));
  }
  app.listen(PORT, () => {
    console.log(`[Dayflow] Server running on http://localhost:${PORT}`);
  });
}
startServer().catch(console.error);
//# sourceMappingURL=server.cjs.map
