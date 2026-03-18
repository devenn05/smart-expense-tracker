import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateRequest";
import { upsertBudget, getBudget,deleteBudget } from "../controllers/budget.controller";
import { upsertBudgetSchema } from "../schemas/finance.schema";

const router = Router();

router.use(protect)

router.get('/', getBudget)
router.post('/', validate(upsertBudgetSchema), upsertBudget)
router.delete('/:id', deleteBudget)

export default router;