import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createEmployeeSchema = z.object({
  employeeId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['admin', 'hr', 'employee']),
  department: z.string().min(2),
  designation: z.string().min(2),
  employmentType: z.string(),
  joiningDate: z.string(),
  phone: z.string(),
  address: z.string(),
  salary: z.object({
    basicSalary: z.number().optional(),
    baseSalary: z.number().optional(),
    hra: z.number(),
    allowances: z.number(),
    bonus: z.number().optional(),
    deductions: z.number().optional(),
    taxDeduction: z.number(),
    netSalary: z.number(),
    bankAccount: z.string().optional()
  }).optional()
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const applyLeaveSchema = z.object({
  leaveType: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(5),
});

export const checkInSchema = z.object({
  location: z.string().optional(),
  note: z.string().optional(),
});
