import mongoose from "mongoose";
import { Budget } from "../models/Budget";
import { Transaction } from "../models/Transaction";
import { AlertHistory } from "../models/AlertHistory";
import { User } from "../models/User";
import { sendBudgetAlertEmail, sendBudgetAlertWhatsApp } from "../utils/notifications";

export const checkAndTriggerBudgetAlert = async (userId: string, categoryId: string) => {
    try {
        // Check if a budget even exists for this specific category
        const budget = await Budget.findOne({ user: userId, category: categoryId }).populate('category', 'name');
        if (!budget) return; // No budget = No alert needed

        // Define the current month/year exactly as our AlertHistory uses it
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const monthYearString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

        // 3. Has this user already received a BUDGET_EXCEEDED warning for this category this month?
        const alreadyWarned = await AlertHistory.exists({
            user: userId,
            category: categoryId,
            alertType: 'BUDGET_EXCEEDED',
            monthYear: monthYearString
        });
        
        // If we already sent them an email this month, quietly exit to prevent spam!
        if (alreadyWarned) return;

        // 4. Calculate exactly how much they have spent THIS month in this specific category
        const totalSpentData = await Transaction.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    category: new mongoose.Types.ObjectId(categoryId),
                    type: 'expense',
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: { _id: null, total: { $sum: '$amount' } }
            }
        ]);

        const currentSpent = totalSpentData[0]?.total || 0;

        // 5. DID THEY CROSS THE LIMIT?
        if (currentSpent > budget.amount) {
            
            // Log it in AlertHistory FIRST to lock it, preventing duplicate async calls from overlapping
            await AlertHistory.create({
                user: userId,
                category: categoryId,
                alertType: 'BUDGET_EXCEEDED',
                monthYear: monthYearString
            });

            // Fetch User Details to get contact info and preferences
            const user = await User.findById(userId);
            if (!user) return;

            const categoryName = (budget.category as any).name;

            // Trigger Notifications based on preferences!
            if (user.alertPreferences.email) {
                await sendBudgetAlertEmail(user.email, user.name, categoryName, budget.amount, currentSpent);
            }
            if (user.alertPreferences.whatsapp && user.phoneNumber) {
                await sendBudgetAlertWhatsApp(user.phoneNumber, categoryName, budget.amount, currentSpent);
            }
        }

    } catch (error) {
        console.error("Alert Trigger Failed:", error);
    }
};