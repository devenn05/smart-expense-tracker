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

// These types extract the TypeScript interface directly from the Zod schemas!
export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;