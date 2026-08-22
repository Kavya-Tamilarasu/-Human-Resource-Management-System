import {
  User,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  Payslip,
  AppNotification,
  AuditLog,
  AnalyticsSummary
} from '../types';

const TOKEN_KEY = 'dayflow_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await request<{ token: string; user: User; employee?: Employee }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (res.token) setStoredToken(res.token);
    return res;
  },

  async register(data: any) {
    const res = await request<{ token: string; user: User; employee: Employee }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.token) setStoredToken(res.token);
    return res;
  },

  async demoLogin(employeeId: string = 'EMP001') {
    const res = await request<{ token: string; user: User; employee: Employee }>('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ employeeId })
    });
    if (res.token) setStoredToken(res.token);
    return res;
  },

  async getMe() {
    return request<{ user: User; employee: Employee }>('/api/auth/me');
  },

  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      removeStoredToken();
    }
  },

  // Employees
  async getEmployees(params: { search?: string; department?: string; role?: string; status?: string; sortBy?: string; sortOrder?: string } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department) query.append('department', params.department);
    if (params.role) query.append('role', params.role);
    if (params.status) query.append('status', params.status);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    return request<{ total: number; employees: Employee[] }>(`/api/employees?${query.toString()}`);
  },

  async getEmployeeById(id: string) {
    return request<Employee>(`/api/employees/${id}`);
  },

  async createEmployee(data: Partial<Employee>) {
    return request<Employee>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateEmployee(id: string, data: Partial<Employee>) {
    return request<Employee>(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteEmployee(id: string) {
    return request<{ message: string }>(`/api/employees/${id}`, {
      method: 'DELETE'
    });
  },

  // Attendance
  async getAttendance(params: { employeeId?: string; date?: string; department?: string; status?: string; month?: string } = {}) {
    const query = new URLSearchParams();
    if (params.employeeId) query.append('employeeId', params.employeeId);
    if (params.date) query.append('date', params.date);
    if (params.department) query.append('department', params.department);
    if (params.status) query.append('status', params.status);
    if (params.month) query.append('month', params.month);
    return request<{ total: number; records: AttendanceRecord[] }>(`/api/attendance?${query.toString()}`);
  },

  async getTodayAttendanceSummary() {
    return request<{
      date: string;
      userRecord: AttendanceRecord | null;
      isCheckedIn: boolean;
      isCheckedOut: boolean;
      stats: { totalEmployees: number; present: number; absent: number; onLeave: number; halfDay: number };
    }>('/api/attendance/today-summary');
  },

  async checkIn(location?: string, note?: string) {
    return request<{ message: string; record: AttendanceRecord }>('/api/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ location, note })
    });
  },

  async checkOut() {
    return request<{ message: string; record: AttendanceRecord }>('/api/attendance/check-out', {
      method: 'POST'
    });
  },

  async manualAttendanceRecord(data: { employeeId: string; date: string; checkInTime?: string; checkOutTime?: string; status: string; note?: string }) {
    return request<{ message: string; record: AttendanceRecord }>('/api/attendance/manual-record', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Leaves
  async getLeaves(params: { employeeId?: string; status?: string; leaveType?: string } = {}) {
    const query = new URLSearchParams();
    if (params.employeeId) query.append('employeeId', params.employeeId);
    if (params.status) query.append('status', params.status);
    if (params.leaveType) query.append('leaveType', params.leaveType);
    return request<{ total: number; leaves: LeaveRequest[] }>(`/api/leaves?${query.toString()}`);
  },

  async getLeaveBalance(employeeId: string) {
    return request<LeaveBalance>(`/api/leaves/balances/${employeeId}`);
  },

  async applyLeave(data: { leaveType: string; startDate: string; endDate: string; reason: string }) {
    return request<{ message: string; leave: LeaveRequest }>('/api/leaves', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async reviewLeave(id: string, status: 'Approved' | 'Rejected', adminRemarks?: string) {
    return request<{ message: string; leave: LeaveRequest }>(`/api/leaves/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminRemarks })
    });
  },

  // Payroll
  async getPayroll(params: { month?: string; year?: number; department?: string; employeeId?: string } = {}) {
    const query = new URLSearchParams();
    if (params.month) query.append('month', params.month);
    if (params.year) query.append('year', params.year.toString());
    if (params.department) query.append('department', params.department);
    if (params.employeeId) query.append('employeeId', params.employeeId);
    return request<{
      totalCount: number;
      totalPayroll: number;
      totalBase: number;
      totalTaxes: number;
      payslips: Payslip[];
    }>(`/api/payroll?${query.toString()}`);
  },

  async generatePayrollBatch(month: string, year: number) {
    return request<{ message: string; createdCount: number }>('/api/payroll/generate-batch', {
      method: 'POST',
      body: JSON.stringify({ month, year })
    });
  },

  async updateSalaryStructure(employeeId: string, data: any) {
    return request<{ message: string; salary: any }>(`/api/payroll/salary-structure/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Analytics
  async getAnalytics() {
    return request<AnalyticsSummary>('/api/analytics');
  },

  // Notifications
  async getNotifications() {
    return request<{ unreadCount: number; notifications: AppNotification[] }>('/api/notifications');
  },

  async markNotificationAsRead(id: string) {
    return request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PUT' });
  },

  async markAllNotificationsAsRead() {
    return request<{ success: boolean }>('/api/notifications/read-all', { method: 'PUT' });
  },

  // Audit Logs
  async getAuditLogs(params: { search?: string; targetEntity?: string; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.targetEntity) query.append('targetEntity', params.targetEntity);
    if (params.limit) query.append('limit', params.limit.toString());
    return request<{ total: number; logs: AuditLog[] }>(`/api/audit-logs?${query.toString()}`);
  },

  // AI Assistant
  async askAIAssistant(message: string) {
    return request<{ answer: string; actionType?: string }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  // Documents
  async uploadDocument(data: { employeeId?: string; title: string; category: string; fileSize?: string }) {
    return request<any>('/api/documents/upload', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
