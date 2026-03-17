import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getAnalytics } from "../controllers/analytics.controller.js";

const router = Router();

router.use(protect);

router.get('/', getAnalytics)

export default router;