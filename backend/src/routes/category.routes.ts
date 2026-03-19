import { Router } from "express";
import { getCategories, deleteCategory, createCategory, updateCategory } from "../controllers/category.controller";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateRequest";
import { createCategorySchema, updateCategorySchema } from "../schemas/finance.schema";

const router = Router();

// user must be logged in for all category actions
router.use(protect);

// get all categories
router.get('/', getCategories);

// create new category
router.post('/', validate(createCategorySchema), createCategory);

// update category by id
router.put('/:id', validate(updateCategorySchema), updateCategory);

// delete category by id
router.delete('/:id', deleteCategory);

export default router;