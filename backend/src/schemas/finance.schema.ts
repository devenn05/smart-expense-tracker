import {z} from 'zod'
import mongoose from 'mongoose'
import { Category } from '../models/Category'

export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Category name must be at least 2 characters'),
        type: z.enum(['income', 'expense']).refine(val => !!val, {message: 'Category type is required'}),
        color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Must be a valid Hex Color code').optional(),
    })
})

export const updateCategorySchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Category name must be at least 2 characters').optional(),
        color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Must be a valid Hex Color code').optional()
    })
});

export const upsertBudgetSchema = z.object({
    body: z.object({
        category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Category ID'),
        amount: z.number().min(0, 'Budget cannot be negative'),
    })
})

export const transactionSchema = z.object({
    body: z.object({
        amount: z.coerce.number().positive('Amount must be greater than zero'),
        type: z.enum(['income', 'expense']).refine(val => !!val, {message: 'Transaction type is required'}),
        category: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid Category ID" }),
        description: z.string().max(100, 'Description too long').optional().default(''),
        date: z.coerce.date().optional() 
    })
})