import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Transaction } from "../models/Transaction";
import { APIFeatures } from "../utils/apiFeatures";

// Add a new transaction
export const createTransaction = asyncHandler(async(req: Request, res: Response)=>{
    const {amount, type, category, description, date} = req.body
    const transaction = await Transaction.create({
        user: req.user?._id,
        amount,
        type,
        category,
        description,
        date: date || new Date()
    })

    // Re-fetch to attach the category info to the response immediately
    const populatedTransaction = await transaction.populate('category', 'name color')

    res.status(201).json({ success: true, data: populatedTransaction });
})

export const getTransaction = asyncHandler(async(req: Request, res: Response)=>{
    const features = new APIFeatures(
        Transaction.find({user: req.user?._id}),
        req.query
    ).filter().dateFilter().sort().paginate();

    const transactions = await features.query.populate('category', 'name color')
    
    res.status(200).json({ success: true, count: transactions.length, data: transactions });
})