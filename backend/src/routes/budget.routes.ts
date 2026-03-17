import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateRequest.js";
import { upsertBudget, getBudget } from "../controllers/budget.controller.js";
import { upsertBudgetSchema } from "../schemas/finance.schema.js";

const router = Router();

router.use(protect)

router.get('/', getBudget)
router.post('/', validate(upsertBudgetSchema), upsertBudget)

export default router;