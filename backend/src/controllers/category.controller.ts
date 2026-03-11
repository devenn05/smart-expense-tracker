import { Request, Response } from "express";
import { Category } from "../models/Category";
import { asyncHandler } from "../utils/asyncHandler";

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