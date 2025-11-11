import { z } from "zod";

export const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(6)
});

export const registerSchema = z.object({
  name: z.string().min(1).max(191),
  userId: z.coerce.number().int(),
  category: z.string().min(1).max(45),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().max(191),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine((payload) => payload.password === payload.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8)
}).refine((payload) => payload.password === payload.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const updateSettingSchema = z.object({
  tenure: z.string().max(255).optional(),
  name: z.string().max(255).optional(),
  logo: z.string().max(255).optional().nullable(),
  favicon: z.string().max(255).optional().nullable(),
  website: z.string().url().max(255).optional().nullable(),
  tagline: z.string().max(255).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  idName: z.string().max(255).optional().nullable(),
  phone: z.string().max(255).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  dueDeadline: z.string().optional().nullable(),
  dueAmount: z.coerce.number().nonnegative().optional(),
  isRegistrationOpen: z.boolean().optional()
});

export const createUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  userId: z.coerce.number().int(),
  category: z.string().min(1).max(255),
  level: z.coerce.number().int().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  password: z.string().min(6),
  isAdmin: z.boolean().optional()
});

export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .extend({ password: z.string().min(6).optional() });

export const updateProfileSchema = z.object({
  phone: z.string().min(1).max(20)
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine((payload) => payload.password === payload.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
