import { Router } from "express";
import { login, logout, getMe, updatePassword, refreshAccessToken, initialRegister, verifyOtp } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateRequest.js";
import { registerSchema, loginSchema, updatePasswordSchema, verifyOtpSchema } from "../schemas/auth.schema.js";
import rateLimit from "express-rate-limit";

const router = Router();

// Allow a maximum of 5 failed login attempts per hour per IP address
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5, 
    message: { success: false, message: 'Too many login attempts, please try again after an hour' }
})

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, 
    message: { success: false, message: 'Too many verification attempts. Please wait 15 minutes to prevent spam.' }
});

router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.patch('/update-password', protect, validate(updatePasswordSchema), updatePassword);
router.post('/refresh', refreshAccessToken);
router.post('/initialRegister',otpLimiter,  validate(registerSchema), initialRegister);
router.post('/verify-otp',otpLimiter, validate(verifyOtpSchema), verifyOtp);

router.get('/me', protect, getMe);

export default router;