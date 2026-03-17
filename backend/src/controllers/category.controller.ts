import { Request, Response } from "express";
import { Category } from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { Transaction } from "../models/Transaction.js";

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
    const {name, type, color} = req.body = req.body
    const category = await Category.create({
        name,
        type,
        color: color || (type === 'income' ? '#10b981' : '#f43f5e'),
        isPredefined: false,
        user: req.user?._id,
    })
    res.status(201).json({ success: true, data: category });
})

//Update a custom category
export const updateCategory = asyncHandler(async (req: Request, res: Response)=>{
    const category = await Category.findById(req.params.id);
    if (!category) {
        throw new AppError("Category not found", 404);
    }

    // Cannot edit predefined categories
    if (category.isPredefined){
        throw new AppError("System predefined categories cannot be modified.", 403);
    }

    // Cannot edit someone else's category
    if (category.user?.toString() !== req.user?._id.toString()){
        throw new AppError('Not authorized to edit this category.', 403);
    }

    const { name, color } = req.body;
    
    // We update safely without altering the 'type' to prevent historical corruption
    if (name) category.name = name;
    if (color) category.color = color;
    
    await category.save();

    res.status(200).json({ success: true, data: category });
});

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