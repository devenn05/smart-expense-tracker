import { Router } from "express";
import { login, logout, getMe, updatePassword, refreshAccessToken, initialRegister, verifyOtp, forgotPassword, resetPassword } from "../controllers/auth.controller";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateRequest";
import { registerSchema, loginSchema, updatePasswordSchema, verifyOtpSchema, forgotPasswordSchema,resetPasswordSchema } from "../schemas/auth.schema";
import rateLimit from "express-rate-limit";

const router = Router();

// Allow a maximum of 5 failed login attempts per hour per IP address
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max:10, 
    message: { success: false, message: 'Too many login attempts, please try again after an hour' }
})

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, 
    message: { success: false, message: 'Too many verification attempts. Please wait 15 minutes to prevent spam.' }
});

router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.patch('/update-password', protect, validate(updatePasswordSchema), updatePassword);
router.post('/refresh', refreshAccessToken);
router.post('/initialRegister',otpLimiter,  validate(registerSchema), initialRegister);
router.post('/verify-otp',otpLimiter, validate(verifyOtpSchema), verifyOtp);
router.post('/forgot-password', otpLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', otpLimiter, validate(resetPasswordSchema), resetPassword);

router.get('/me', protect, getMe);

export default router;