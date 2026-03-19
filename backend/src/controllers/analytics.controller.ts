import { Request, Response } from "express";
import { generateDashboardAnalytics } from "../services/analytics.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { detectOverspending } from "../services/insight.service";

// get dashboard analytics + insights
export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new AppError('User not authorized', 400);
    }

    const userId = req.user._id.toString();

    const analytics = await generateDashboardAnalytics(userId);

    // detect overspending based on category breakdown
    const insights = await detectOverspending(userId, analytics.categoryBreakdown);

    res.status(200).json({
        success: true,
        data: {
            ...analytics,
            overspending: insights
        }
    });
});