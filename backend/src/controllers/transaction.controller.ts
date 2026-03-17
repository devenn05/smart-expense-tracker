import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Transaction } from "../models/Transaction.js";
import { APIFeatures } from "../utils/apiFeatures.js";
import { AppError } from "../utils/AppError.js";
import { Category } from "../models/Category.js";
import { checkAndTriggerBudgetAlert, checkAndTriggerAnomalyAlert } from "../services/alert.service.js";

// Add a new transaction
export const createTransaction = asyncHandler(async(req: Request, res: Response)=>{
    const {amount, type, category, description, date} = req.body;

    // Verify category matches transaction type
    const validCategory = await Category.findById(category);
    if (!validCategory) throw new AppError("Category not found.", 404);
    
    // Category Type must match Transaction Type
    if (validCategory.type !== type) {
        throw new AppError(`Mismatch error: You cannot use a '${validCategory.type}' category for an '${type}' transaction.`, 400);
    }

    const transaction = await Transaction.create({
        user: req.user?._id, amount, type, category, description,
        date: date || new Date()
    });

    // TRIGGER BUDGET CHECK in the background asynchronously!
    if (type === 'expense') {
        const uid = req.user?._id.toString()!;
        checkAndTriggerBudgetAlert(uid, category);
        checkAndTriggerAnomalyAlert(uid, category);
    }

    const populatedTransaction = await transaction.populate('category', 'name color type');
    res.status(201).json({ success: true, data: populatedTransaction });
});


export const getTransaction = asyncHandler(async(req: Request, res: Response)=>{
    let query = Transaction.find({user: req.user?._id});

    // Helper function to prevent Regex Denial of Service (ReDoS)
    const escapeRegex = (text: string) => text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    // Make sure search exists AND is explicitly a string to satisfy TypeScript
    if (req.query.search && typeof req.query.search === 'string') {
        const safeSearchString = escapeRegex(req.query.search);
        
        query = query.find({ 
            description: { $regex: safeSearchString, $options: 'i' } 
        });
    }

    // Capture global lengths BEFORE pagination skips happen locally. 
    // Uses clone() since executing count limits our instance's operational path moving forward.
    const totalElementsQuery = query.clone();

    // Map through pagination logics cleanly natively built prior.
    const features = new APIFeatures(
        query,
        req.query
    ).filter().dateFilter().sort().paginate();

    const transactions = await features.query.populate('category', 'name color type')
    
    // Calculate Paginations Mathematics for the Front-End Table!
    const totalElements = await totalElementsQuery.countDocuments();
    const limit = Number(req.query.limit) || 10;
    const totalPages = Math.ceil(totalElements / limit) || 1;
    
    res.status(200).json({ success: true, count: transactions.length, totalElements, totalPages, data: transactions });
})

export const updateTransaction = asyncHandler(async (req: Request, res: Response)=>{
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) throw new AppError('Transaction not found', 404);

    if (transaction.user.toString() !== req.user?._id.toString()) {
        throw new AppError('Not authorized to update this transaction', 403);
    }

    // Check if user is attempting to update the category or the type
    const newCategory = req.body.category || transaction.category;
    const newType = req.body.type || transaction.type;

    if (req.body.category || req.body.type) {
        const checkCategory = await Category.findById(newCategory);
        if (!checkCategory || checkCategory.type !== newType) {
            throw new AppError(`Mismatch error: Ensure category and transaction type match correctly.`, 400);
        }
    }
    

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).populate('category', 'name color type');

    // TRIGGER CHECK HERE TOO (incase editing an amount broke the limit!)
    if (newType === 'expense') {
        const uid = req.user?._id.toString()!;
        const catStr = newCategory.toString();
        checkAndTriggerBudgetAlert(uid, catStr);
        checkAndTriggerAnomalyAlert(uid, catStr);
    }

    res.status(200).json({ success: true, data: transaction });
});

export const deleteTransaction = asyncHandler(async(req: Request, res: Response)=>{
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction){
        throw new AppError('Transaction not found', 404)
    }
    // Checks that you can only edit your own transactions
    if (transaction.user.toString() !== req.user?._id.toString()) {
        throw new AppError('Not authorized to delete this transaction', 403);
    }
    await transaction.deleteOne()
    res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
})