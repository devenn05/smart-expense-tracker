import { z } from 'zod';

// schema for user registration
export const registerSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, 'Name must be at least 2 characters long'),

        email: z.email('Invalid email address format'),

        password: z.string()
            .min(8, 'Password must be atleast 8 characters long.')
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),

        // optional phone number with country code
        phoneNumber: z
            .string()
            .regex(/^\+[1-9]\d{1,14}$/, "Phone number must include country code (e.g., +1234567890)")
            .optional()
    })
});

// schema for verifying OTP
export const verifyOtpSchema = z.object({
    body: z.object({
        email: z.email('Invalid email address format'),
        emailOtp: z.string().length(6, "Email OTP must be 6 digits"),
        whatsappOtp: z
            .string()
            .length(6, "WhatsApp OTP must be 6 digits")
            .optional()
    })
});

// schema for login
export const loginSchema = z.object({
    body: z.object({
        email: z.email('Invalid email address format'),
        password: z.string().min(8, 'Password is Required')
    })
});

// schema for forgot password
export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.email('Invalid email address format')
    })
});

// schema for resetting password
export const resetPasswordSchema = z.object({
    body: z.object({
        email: z.email('Invalid email format'),
        otp: z.string().length(6, "OTP must be exactly 6 digits"),
        newPassword: z.string()
            .min(8, 'Password must be at least 8 characters long.')
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
    })
});

// schema for updating password (logged in user)
export const updatePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string(),
        newPassword: z.string()
            .min(8, 'Password must be atleast 8 characters long.')
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
    })
});