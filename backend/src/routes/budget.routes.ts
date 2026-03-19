import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateRequest";
import { upsertBudget, getBudget, deleteBudget } from "../controllers/budget.controller";
import { upsertBudgetSchema } from "../schemas/finance.schema";

const router = Router();

// protect all budget routes
router.use(protect);

// get all budgets for user
router.get('/', getBudget);

// create or update budget
router.post('/', validate(upsertBudgetSchema), upsertBudget);

// delete budget by id
router.delete('/:id', deleteBudget);

export default router;