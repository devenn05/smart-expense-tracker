import { Router } from "express";
import { register, login, logout, getMe, updatePassword } from "../controllers/auth.controller";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateRequest";
import { registerSchema, loginSchema, updatePasswordSchema } from "../schemas/auth.schema";
import rateLimit from "express-rate-limit";

const router = Router();

// Allow a maximum of 5 failed login attempts per hour per IP address
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5, 
    message: { success: false, message: 'Too many login attempts, please try again after an hour' }
})

router.post('/register', validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.patch('/update-password', protect, validate(updatePasswordSchema), updatePassword);

router.get('/me', protect, getMe);

export default router;