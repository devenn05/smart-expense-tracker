import { Router } from "express";
import { transactionSchema } from "../schemas/finance.schema";
import { createTransaction, deleteTransaction, updateTransaction, getTransaction } from "../controllers/transaction.controller";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateRequest";

const router = Router();

// all transaction routes require login
router.use(protect);

// get all transactions or create a new one
router.route('/')
    .get(getTransaction)
    .post(validate(transactionSchema), createTransaction);

// update or delete a transaction by id
router.route('/:id')
    .put(validate(transactionSchema), updateTransaction)
    .delete(deleteTransaction);

export default router;