import { Request, Response } from "express";
import { Category } from "../models/Category";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { Transaction } from "../models/Transaction";

// fetch all categories (both predefined + user's own)
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await Category.find({
        $or: [
            { isPredefined: true },
            { user: req.user?._id }
        ]
    }).sort({ isPredefined: -1, name: 1 }); // predefined first, then sort by name

    res.status(200).json({ success: true, data: categories });
});

// create a new custom category
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
    const { name, type, color } = req.body;

    const category = await Category.create({
        name,
        type,
        color: color || (type === 'income' ? '#10b981' : '#f43f5e'), // default color based on type
        isPredefined: false,
        user: req.user?._id,
    });

    res.status(201).json({ success: true, data: category });
});

// update existing custom category
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    // block editing predefined ones
    if (category.isPredefined) {
        throw new AppError("System predefined categories cannot be modified.", 403);
    }

    // make sure user owns this category
    if (category.user?.toString() !== req.user?._id.toString()) {
        throw new AppError('Not authorized to edit this category.', 403);
    }

    const { name, color } = req.body;

    // only allow updating name and color
    if (name) category.name = name;
    if (color) category.color = color;

    await category.save();

    res.status(200).json({ success: true, data: category });
});

// delete a category
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    // prevent deleting predefined categories
    if (category.isPredefined) {
        throw new AppError("Cannot delete predefined Categories", 403);
    }

    // ensure ownership
    if (category.user?.toString() !== req.user?._id.toString()) {
        throw new AppError('Not authorized to delete this category', 403);
    }

    // check if any transactions are using this category
    const linkedTransactionsCount = await Transaction.countDocuments({ category: category._id });

    if (linkedTransactionsCount > 0) {
        throw new AppError(
            'Cannot delete category because it is linked to transactions. Update or delete those first.',
            400
        );
    }

    await category.deleteOne();

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
});