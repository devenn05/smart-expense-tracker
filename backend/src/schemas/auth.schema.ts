import {z} from 'zod';

export const registerSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, 'Name must be at least 2 characters long'),

        email: z
            .email('Invalid email address format'),

        password: z.string()
            .min(8, 'Password must be atleast 8 characters long.')
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),
        
        phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, "Phone number must include country code (e.g., +1234567890)").optional()
    })
});

export const verifyOtpSchema = z.object({
    body: z.object({
        email: z.email('Invalid email address format'),
        emailOtp: z.string().length(6, "Email OTP must be 6 digits"),
        whatsappOtp: z.string().length(6, "WhatsApp OTP must be 6 digits").optional()
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z
            .email('Invalid email address format'),

            password: z.string()
            .min(8, 'Password is Required')
    })
})

export const updatePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string(),
        newPassword: z.string()
            .min(8, 'Password must be atleast 8 characters long.')
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
    })
})