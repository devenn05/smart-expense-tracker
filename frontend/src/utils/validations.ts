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
});

// Category Validation
export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid Hex Color').optional().or(z.literal('')),
});

// Budget Validation
export const budgetSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  amount: z.coerce.number().positive('Budget must be greater than 0')
});


// These types extract the TypeScript interface directly from the Zod schemas!
export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type CategoryForm = z.infer<typeof categorySchema>;
export type BudgetForm = z.infer<typeof budgetSchema>;