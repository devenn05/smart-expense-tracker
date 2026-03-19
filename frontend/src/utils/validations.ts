import { z } from 'zod';

/**
 * Authentication & Identity Schemas
 */

export const loginSchema = z.object({
    email: z.email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

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
    // Enforce E.164 format for WhatsApp integration; allows empty string if user skips
    phoneNumber: z.string()
        .regex(/^\+[1-9]\d{1,14}$/, "Must include country code (e.g., +1234567890)")
        .optional()
        .or(z.literal(''))
});

export const verifyOtpSchema = z.object({
    emailOtp: z.string().length(6, 'Must be exactly 6 digits'),
    whatsappOtp: z.string().length(6, 'Must be exactly 6 digits').optional().or(z.literal(''))
});

/**
 * Finance & Categorization Schemas
 */

export const categorySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    type: z.enum(['income', 'expense']),
    color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid Hex Color').optional().or(z.literal('')),
});

export const updateCategorySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid Hex Color').optional().or(z.literal('')),
});

export const budgetSchema = z.object({
    category: z.string().min(1, 'Please select a category'),
    // Coerce values to handle raw input from form fields
    amount: z.coerce.number().positive('Budget must be greater than 0')
});

export const transactionFormSchema = z.object({
    type: z.enum(['income', 'expense']),
    amount: z.coerce.number().positive('Amount must be positive'),
    category: z.string().min(1, 'Please select a category'),
    date: z.string().min(1, 'Please select a date'),
    description: z.string().max(100, 'Description is too long').optional(),
});

/**
 * Password Management & Recovery
 */

export const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Please enter current password'),
    newPassword: z.string()
        .min(8, 'New Password must be 8+ chars')
        .regex(/[0-9]/, "Needs a number")
        .regex(/[a-z]/, "Needs lower")
        .regex(/[A-Z]/, "Needs upper")
});

export const forgotPasswordSchema = z.object({ 
    email: z.email('Invalid format') 
});

export const resetPasswordSchema = z.object({ 
    emailOtp: z.string().length(6, "Code strictly 6 digits"), 
    newPassword: z.string().min(8, '8+ characters minimum') 
});

/**
 * Inferred TypeScript types derived from Zod schemas
 */

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type VerifyOtpForm = z.infer<typeof verifyOtpSchema>; 
export type CategoryForm = z.infer<typeof categorySchema>;
export type UpdateCategoryForm = z.infer<typeof updateCategorySchema>;
export type BudgetForm = z.infer<typeof budgetSchema>;
// Use .input for transactions to account for coerced types before transformation
export type TransactionForm = z.input<typeof transactionFormSchema>;
export type UpdatePasswordForm = z.infer<typeof updatePasswordSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;