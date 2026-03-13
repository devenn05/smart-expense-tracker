import { Request, Response } from "express";
import { Category } from "../models/Category";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { Transaction } from "../models/Transaction";

// Get all applicable categories (Predefined + User's Custom)
export const getCategories = asyncHandler(async (req: Request, res: Response)=>{
    const categories = await Category.find({
        $or: [
            {isPredefined: true},
            {user: req.user?._id}
        ]
    }).sort({isPredefined: -1, name: 1}) // // Sorts by putting predefined first, then alphabetical

    res.status(200).json({success: true, data: categories})
})

// Create a custom category
export const createCategory = asyncHandler(async (req: Request, res: Response)=>{
    const {name, color} = req.body
    const category = await Category.create({
        name,
        color: color || '#3B82F6',
        isPredefined: false,
        user: req.user?._id,
    })
    res.status(201).json({ success: true, data: category });
})

// Delete a category
export const deleteCategory = asyncHandler(async(req: Request, res: Response)=>{
    const category = await Category.findById(req.params.id)
    if (!category){
        throw new AppError("Category not found", 404)
    }

    // Ensure users cannot delete predefined categories
    if (category.isPredefined){
        throw new AppError("Cannot delete predefined Categories", 403)
    }

    // Ensure users can only delete THEIR OWN custom categories
    if (category.user?.toString() !== req.user?._id.toString()){
        throw new AppError('Not authorized to delete this category', 403);
    }

    // Prevent deletion if transactions are currently linked to this category
    const linkedTransactionsCount = await Transaction.countDocuments({ category: category._id });
    if (linkedTransactionsCount > 0) {
        throw new AppError('Cannot delete category because it is actively linked to existing transactions. Please re-assign or delete those transactions first.', 400);
    }

    await category.deleteOne();
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
})