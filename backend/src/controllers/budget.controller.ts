import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Budget } from "../models/Budget";
import { Category } from "../models/Category";
import { AppError } from "../utils/AppError";
import { AlertHistory } from "../models/AlertHistory";

// Set or update a monthly budget for a category (Upsert)
export const upsertBudget = asyncHandler(async(req: Request, res: Response)=>{
    const {category, amount} = req.body;

     // Validate the category actually belongs to this exact user or is Predefined!
    const validCategory = await Category.findOne({
        _id: category,
        $or: [
            { user: req.user?._id },
            { isPredefined: true }
        ]
    });

    if (!validCategory) {
        throw new AppError("Invalid Category assignment. Target does not exist or access is forbidden.", 403);
    }

    if (validCategory.type === 'income') {
        throw new AppError("Budgets can only be set for Expense categories. Setting a limit on Income is invalid.", 400);
    }

    // It checks for a matching user and category.
    // If it finds it -> updates the amount.
    // If it doesn't -> creates a brand new document!
    let budget = await Budget.findOneAndUpdate(
        {user: req.user?._id, category: category},
        {amount: amount},{
            new: true,
            upsert: true, 
            runValidators: true
        }
    )
    budget = await budget.populate('category', 'name color isPredefined type')

    const now = new Date();
    const monthYearString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    await AlertHistory.findOneAndDelete({
        user: req.user?._id,
        category: category,
        alertType: 'BUDGET_EXCEEDED',
        monthYear: monthYearString
    });
    res.status(200).json({ success: true, data: budget });
    res.status(200).json({ success: true, data: budget });
})

export const getBudget = asyncHandler(async(req: Request, res: Response)=>{
    // // Populate fills in the actual category details instead of just returning the ID
    const budget = await Budget.find({user: req.user?._id}).populate('category', 'name color isPredefined type')

    res.status(200).json({ success: true, data: budget });
})

export const deleteBudget = asyncHandler(async(req: Request, res: Response)=>{
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user?._id });
    if (!budget) throw new AppError('Budget mapping not found', 404);

    await budget.deleteOne();
    res.status(200).json({ success: true, message: 'Budget tracking boundary successfully removed' });
});