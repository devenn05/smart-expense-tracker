import { Request, Response } from "express";
import { generateDashboardAnalytics } from "../services/analytics.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export const getAnalytics = asyncHandler( async(req: Request, res: Response)=>{
    if (!req.user){
        throw new AppError('User not authorized', 400);
    }
    const userId = req.user._id
    const analytics = await generateDashboardAnalytics(userId.toString());
    res.status(200).json({ success: true, data: analytics });
});