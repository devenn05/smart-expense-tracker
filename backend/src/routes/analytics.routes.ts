import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { getAnalytics } from "../controllers/analytics.controller";

const router = Router();

router.use(protect);

router.get('/', getAnalytics)

export default router;