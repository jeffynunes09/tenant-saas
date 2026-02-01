import { z } from 'zod';

// ==================== TENANT ====================

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  subdomain: z.string(),
  plan: z.enum(['basic', 'premium', 'enterprise']),
  isActive: z.boolean(),
  maxUsers: z.number(),
  maxAppointments: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tenant = z.infer<typeof TenantSchema>;

// ==================== USER ====================

export const UserRoleSchema = z.enum(['OWNER', 'ADMIN', 'STAFF']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema,
  isActive: z.boolean(),
  tenantId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(3),
  password: z.string().min(6),
  role: UserRoleSchema.optional().default('STAFF'),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

// ==================== SERVICE ====================

export const ServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  duration: z.number().positive(),
  price: z.number().positive(),
  isActive: z.boolean(),
  category: z.string().optional(),
  tenantId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Service = z.infer<typeof ServiceSchema>;

export const CreateServiceSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  duration: z.number().min(5).max(480), // 5 min a 8 horas
  price: z.number().positive(),
  category: z.string().optional(),
});

export type CreateServiceDto = z.infer<typeof CreateServiceSchema>;

// ==================== CUSTOMER ====================

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string(),
  notes: z.string().optional(),
  tenantId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Customer = z.infer<typeof CustomerSchema>;

export const CreateCustomerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\d{10,11}$/),
  notes: z.string().optional(),
});

export type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>;

// ==================== APPOINTMENT ====================

export const AppointmentStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
  'NO_SHOW',
]);

export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().optional(),
  startTime: z.date(),
  endTime: z.date(),
  status: AppointmentStatusSchema,
  notes: z.string().optional(),
  cancelReason: z.string().optional(),
  tenantId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Appointment = z.infer<typeof AppointmentSchema>;

export const CreateAppointmentSchema = z.object({
  customerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().optional(),
  startTime: z.string().datetime(),
  notes: z.string().optional(),
});

export type CreateAppointmentDto = z.infer<typeof CreateAppointmentSchema>;

// ==================== AUTH ====================

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  tenantName: z.string().min(3),
  subdomain: z.string().min(3).regex(/^[a-z0-9-]+$/),
  email: z.string().email(),
  name: z.string().min(3),
  password: z.string().min(6),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

// ==================== API RESPONSES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
