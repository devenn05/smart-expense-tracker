import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Budget } from "../models/Budget";
import { Category } from "../models/Category";
import { AppError } from "../utils/AppError";

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
    budget = await budget.populate('category', 'name color isPredefined')
    res.status(200).json({ success: true, data: budget });
})

export const getBudget = asyncHandler(async(req: Request, res: Response)=>{
    // // Populate fills in the actual category details instead of just returning the ID
    const budget = await Budget.find({user: req.user?._id}).populate('category', 'name color isPredefined')

    res.status(200).json({ success: true, data: budget });
})