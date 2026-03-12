import { Router } from "express";
import { transactionSchema } from "../schemas/finance.schema";
import { createTransaction, deleteTransaction, updateTransaction, getTransaction } from "../controllers/transaction.controller";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateRequest";

const router = Router();

router.use(protect)

router.route('/').get(getTransaction).post(createTransaction)
router.route('/:id').put(validate(transactionSchema), updateTransaction).delete(deleteTransaction)

export default router;