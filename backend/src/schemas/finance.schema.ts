import {z} from 'zod'

export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Category name must be at least 2 characters'),
        color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Must be a valid Hex Color code').optional(),
    })
})

export const upsertBudgetSchema = z.object({
    body: z.object({
        category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Category ID'),
        amount: z.number().min(0, 'Budget cannot be negative'),
    })
})