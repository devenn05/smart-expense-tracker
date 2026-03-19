import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { getAnalytics } from "../controllers/analytics.controller";

const router = Router();

// all analytics routes require login
router.use(protect);

// get dashboard analytics data
router.get('/', getAnalytics);

export default router;