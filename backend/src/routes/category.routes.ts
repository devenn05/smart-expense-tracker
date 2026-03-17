import { Router } from "express";
import { getCategories, deleteCategory, createCategory, updateCategory } from "../controllers/category.controller";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateRequest";
import { createCategorySchema, updateCategorySchema } from "../schemas/finance.schema";

const router = Router();

router.use(protect)

router.get('/', getCategories);
router.post('/', validate(createCategorySchema), createCategory);
router.put('/:id', validate(updateCategorySchema), updateCategory); 
router.delete('/:id', deleteCategory)

export default router;