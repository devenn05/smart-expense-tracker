import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { Transaction } from "../models/Transaction";
import { APIFeatures } from "../utils/apiFeatures";
import { AppError } from "../utils/AppError";

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

export const updateTransaction = asyncHandler(async (req: Request, res: Response)=>{
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction){
        throw new AppError('Transaction not found', 404)
    }
    // Checks that you can only edit your own transactions
    if (transaction.user.toString() !== req.user?._id.toString()) {
        throw new AppError('Not authorized to update this transaction', 403);
    }

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).populate('category', 'name color');

    res.status(200).json({ success: true, data: transaction });
})

export const deleteTransaction = asyncHandler(async(req: Request, res: Response)=>{
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction){
        throw new AppError('Transaction not found', 404)
    }
    // Checks that you can only edit your own transactions
    if (transaction.user.toString() !== req.user?._id.toString()) {
        throw new AppError('Not authorized to delete this transaction', 403);
    }
    transaction.deleteOne()
    res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
})