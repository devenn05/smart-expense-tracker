import { Request, Response } from "express";
import { generateDashboardAnalytics } from "../services/analytics.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { detectOverspending } from "../services/insight.service.js";

export const getAnalytics = asyncHandler( async(req: Request, res: Response)=>{
    if (!req.user){
        throw new AppError('User not authorized', 400);
    }
    const userId = req.user._id.toString()
    const analytics = await generateDashboardAnalytics(userId);
    const insights = await detectOverspending(userId, analytics.categoryBreakdown)
    res.status(200).json({ success: true, data: {
        ...analytics,
        overspending: insights
    } });
});