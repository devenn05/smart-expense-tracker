import { Router } from "express";
import { getCategories, deleteCategory, createCategory, updateCategory } from "../controllers/category.controller.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateRequest.js";
import { createCategorySchema, updateCategorySchema } from "../schemas/finance.schema.js";

const router = Router();

router.use(protect)

router.get('/', getCategories);
router.post('/', validate(createCategorySchema), createCategory);
router.put('/:id', validate(updateCategorySchema), updateCategory); 
router.delete('/:id', deleteCategory)

export default router;