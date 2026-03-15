import {z} from 'zod';

export const loginSchema = z.object({
    email: z.email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
    name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(30, 'Maxmimum of 30 characters only.'),

    email: z.email('Invalid email format'),

    password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number'),

    phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, "Must include country code (e.g., +1234567890)").optional().or(z.literal(''))
});

export const verifyOtpSchema = z.object({
    emailOtp: z.string().length(6, 'Must be exactly 6 digits'),
    whatsappOtp: z.string().length(6, 'Must be exactly 6 digits').optional().or(z.literal(''))
});

// Category Validation
export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['income', 'expense']),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid Hex Color').optional().or(z.literal('')),
});

export const updateCategorySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid Hex Color').optional().or(z.literal('')),
});

// Budget Validation
export const budgetSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  amount: z.coerce.number().positive('Budget must be greater than 0')
});

// Transaction form
export const transactionFormSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Please select a category'),
  date: z.string().min(1, 'Please select a date'),
  description: z.string().max(100, 'Description is too long').optional(),
});

// These types extract the TypeScript interface directly from the Zod schemas!
export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type VerifyOtpForm = z.infer<typeof verifyOtpSchema>; 
export type CategoryForm = z.infer<typeof categorySchema>;
export type UpdateCategoryForm = z.infer<typeof updateCategorySchema>;
export type BudgetForm = z.infer<typeof budgetSchema>;
export type TransactionForm = z.input<typeof transactionFormSchema>;