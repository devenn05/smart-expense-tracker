import { Router } from "express";
import { transactionSchema } from "../schemas/finance.schema.js";
import { createTransaction, deleteTransaction, updateTransaction, getTransaction } from "../controllers/transaction.controller.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateRequest.js";

const router = Router();

router.use(protect)

router.route('/').get(getTransaction).post(validate(transactionSchema), createTransaction)
router.route('/:id').put(validate(transactionSchema), updateTransaction).delete(deleteTransaction)

export default router;