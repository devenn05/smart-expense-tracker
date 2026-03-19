import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Budget } from "../models/Budget";
import { Category } from "../models/Category";
import { AppError } from "../utils/AppError";
import { AlertHistory } from "../models/AlertHistory";

// create or update budget (upsert)
export const upsertBudget = asyncHandler(async (req: Request, res: Response) => {
    const { category, amount } = req.body;

    // check if category is valid for this user
    const validCategory = await Category.findOne({
        _id: category,
        $or: [
            { user: req.user?._id },
            { isPredefined: true }
        ]
    });

    if (!validCategory) {
        throw new AppError("Invalid Category assignment.", 403);
    }

    // only expense categories can have budgets
    if (validCategory.type === 'income') {
        throw new AppError("Cannot set budget for income category.", 400);
    }

    // update if exists, else create new
    let budget = await Budget.findOneAndUpdate(
        { user: req.user?._id, category: category },
        { amount: amount },
        {
            new: true,
            upsert: true,
            runValidators: true
        }
    );

    // attach category details
    budget = await budget.populate('category', 'name color isPredefined type');

    // reset alert if budget updated
    const now = new Date();
    const monthYearString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

    await AlertHistory.findOneAndDelete({
        user: req.user?._id,
        category: category,
        alertType: 'BUDGET_EXCEEDED',
        monthYear: monthYearString
    });

    res.status(200).json({ success: true, data: budget });
});

// get all budgets for user
export const getBudget = asyncHandler(async (req: Request, res: Response) => {
    const budget = await Budget.find({ user: req.user?._id })
        .populate('category', 'name color isPredefined type');

    res.status(200).json({ success: true, data: budget });
});

// delete a budget
export const deleteBudget = asyncHandler(async (req: Request, res: Response) => {
    const budget = await Budget.findOne({
        _id: req.params.id,
        user: req.user?._id
    });

    if (!budget) {
        throw new AppError('Budget mapping not found', 404);
    }

    await budget.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Budget removed successfully'
    });
});