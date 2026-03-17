import mongoose from "mongoose";
import { Budget } from "../models/Budget.js";
import { Transaction } from "../models/Transaction.js";
import { AlertHistory } from "../models/AlertHistory.js";
import { User } from "../models/User.js";
import { sendBudgetAlertEmail, sendBudgetAlertWhatsApp, sendAnomalyAlertEmail, sendAnomalyAlertWhatsApp } from "../utils/notifications.js";

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

export const checkAndTriggerAnomalyAlert = async (userId: string, categoryId: string) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const monthYearString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

        // 1. Did we already warn them about an anomaly for this category this month? (Anti-spam!)
        const alreadyWarned = await AlertHistory.exists({
            user: userId,
            category: categoryId,
            alertType: 'OVERSPENDING_ANOMALY',
            monthYear: monthYearString
        });
        if (alreadyWarned) return;

        // 2. Fetch History Dates (Strictly 3 prior months)
        const startOfHistory = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const endOfHistory = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        // 3. Mathematical Pipeline - specifically target just this ONE category
        const historyData = await Transaction.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    category: new mongoose.Types.ObjectId(categoryId),
                    type: 'expense',
                    date: { $gte: startOfHistory, $lte: endOfHistory }
                }
            },
            {
                $group: { _id: { month: { $month: '$date' }, year: { $year: '$date' } }, monthlyTotal: { $sum: '$amount' } }
            },
            {
                $group: { _id: null, historicalAverage: { $avg: '$monthlyTotal' }, monthsOfData: { $sum: 1 } }
            }
        ]);

        const historicalAverage = historyData[0]?.historicalAverage || 0;
        
        // If they have no real history yet, we shouldn't blast them with alerts
        if (historicalAverage === 0) return;

        // 4. Find how much they spent this current month so far
        const currentSpentData = await Transaction.aggregate([
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

        const currentSpent = currentSpentData[0]?.total || 0;

        // 5. THE RULE: Is current spending strictly > 40% of their history?
        if (currentSpent > (historicalAverage * 1.4)) {

            // Log to prevent duplicate alerts!
            await AlertHistory.create({
                user: userId,
                category: categoryId,
                alertType: 'OVERSPENDING_ANOMALY',
                monthYear: monthYearString
            });

            // Trigger Notifications
            const user = await User.findById(userId);
            const transactionDoc = await Transaction.findOne({ category: categoryId }).populate('category', 'name');
            const categoryName = transactionDoc ? (transactionDoc.category as any).name : 'Expense';

            if (user?.alertPreferences.email) {
                await sendAnomalyAlertEmail(user.email, user.name, categoryName, historicalAverage, currentSpent);
            }
            if (user?.alertPreferences.whatsapp && user.phoneNumber) {
                await sendAnomalyAlertWhatsApp(user.phoneNumber, categoryName, historicalAverage, currentSpent);
            }
        }
    } catch (error) {
        console.error("Anomaly Alert Trigger Failed:", error);
    }
};