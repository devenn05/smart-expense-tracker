import { Router } from "express";
import { register, login, logout, getMe } from "../controllers/auth.controller";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateRequest";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);

router.get('/me', protect, getMe);

export default router;