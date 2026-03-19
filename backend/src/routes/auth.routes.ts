import { Router } from "express";
import {
    login,
    logout,
    getMe,
    updatePassword,
    refreshAccessToken,
    initialRegister,
    verifyOtp,
    forgotPassword,
    resetPassword
} from "../controllers/auth.controller";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateRequest";
import {
    registerSchema,
    loginSchema,
    updatePasswordSchema,
    verifyOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from "../schemas/auth.schema";
import rateLimit from "express-rate-limit";

const router = Router();

// limit login attempts to avoid brute force
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many login attempts, please try again after an hour'
    }
});

// limit OTP and password reset attempts
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many verification attempts. Please wait 15 minutes.'
    }
});

// login
router.post('/login', loginLimiter, validate(loginSchema), login);

// logout
router.post('/logout', logout);

// update password (requires login)
router.patch('/update-password', protect, validate(updatePasswordSchema), updatePassword);

// refresh access token
router.post('/refresh', refreshAccessToken);

// start registration (send otp)
router.post('/initialRegister', otpLimiter, validate(registerSchema), initialRegister);

// verify otp
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), verifyOtp);

// forgot password (send reset otp/email)
router.post('/forgot-password', otpLimiter, validate(forgotPasswordSchema), forgotPassword);

// reset password
router.post('/reset-password', otpLimiter, validate(resetPasswordSchema), resetPassword);

// get current logged in user
router.get('/me', protect, getMe);

export default router;