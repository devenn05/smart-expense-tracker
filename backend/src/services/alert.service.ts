import mongoose from "mongoose";
import { Budget } from "../models/Budget";
import { Transaction } from "../models/Transaction";
import { AlertHistory } from "../models/AlertHistory";
import { User } from "../models/User";
import {
    sendBudgetAlertEmail,
    sendBudgetAlertWhatsApp,
    sendAnomalyAlertEmail,
    sendAnomalyAlertWhatsApp
} from "../utils/notifications";

// check if user crossed budget limit
export const checkAndTriggerBudgetAlert = async (userId: string, categoryId: string) => {
    try {
        // get budget for this category
        const budget = await Budget.findOne({
            user: userId,
            category: categoryId
        }).populate('category', 'name');

        if (!budget) return;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const monthYearString = `${now.getFullYear()}-${(now.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`;

        // avoid sending same alert multiple times
        const alreadyWarned = await AlertHistory.exists({
            user: userId,
            category: categoryId,
            alertType: 'BUDGET_EXCEEDED',
            monthYear: monthYearString
        });

        if (alreadyWarned) return;

        // calculate current month's spending for this category
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

        // trigger alert if limit crossed
        if (currentSpent > budget.amount) {
            // store alert to avoid duplicates
            await AlertHistory.create({
                user: userId,
                category: categoryId,
                alertType: 'BUDGET_EXCEEDED',
                monthYear: monthYearString
            });

            const user = await User.findById(userId);
            if (!user) return;

            const categoryName = (budget.category as any).name;

            // send notifications based on user preferences
            if (user.alertPreferences.email) {
                await sendBudgetAlertEmail(
                    user.email,
                    user.name,
                    categoryName,
                    budget.amount,
                    currentSpent
                );
            }

            if (user.alertPreferences.whatsapp && user.phoneNumber) {
                await sendBudgetAlertWhatsApp(
                    user.phoneNumber,
                    categoryName,
                    budget.amount,
                    currentSpent
                );
            }
        }

    } catch (error) {
        console.error("Alert Trigger Failed:", error);
    }
};

// check abnormal spending compared to past months
export const checkAndTriggerAnomalyAlert = async (userId: string, categoryId: string) => {
    try {
        const now = new Date();

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const monthYearString = `${now.getFullYear()}-${(now.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`;

        // prevent duplicate alerts
        const alreadyWarned = await AlertHistory.exists({
            user: userId,
            category: categoryId,
            alertType: 'OVERSPENDING_ANOMALY',
            monthYear: monthYearString
        });

        if (alreadyWarned) return;

        // get last 3 months history
        const startOfHistory = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const endOfHistory = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

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
                $group: {
                    _id: {
                        month: { $month: '$date' },
                        year: { $year: '$date' }
                    },
                    monthlyTotal: { $sum: '$amount' }
                }
            },
            {
                $group: {
                    _id: null,
                    historicalAverage: { $avg: '$monthlyTotal' },
                    monthsOfData: { $sum: 1 }
                }
            }
        ]);

        const historicalAverage = historyData[0]?.historicalAverage || 0;

        if (historicalAverage === 0) return;

        // current month spending
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

        // trigger alert if spending is 40% higher than average
        if (currentSpent > (historicalAverage * 1.4)) {

            await AlertHistory.create({
                user: userId,
                category: categoryId,
                alertType: 'OVERSPENDING_ANOMALY',
                monthYear: monthYearString
            });

            const user = await User.findById(userId);
            const transactionDoc = await Transaction
                .findOne({ category: categoryId })
                .populate('category', 'name');

            const categoryName = transactionDoc
                ? (transactionDoc.category as any).name
                : 'Expense';

            if (user?.alertPreferences.email) {
                await sendAnomalyAlertEmail(
                    user.email,
                    user.name,
                    categoryName,
                    historicalAverage,
                    currentSpent
                );
            }

            if (user?.alertPreferences.whatsapp && user.phoneNumber) {
                await sendAnomalyAlertWhatsApp(
                    user.phoneNumber,
                    categoryName,
                    historicalAverage,
                    currentSpent
                );
            }
        }

    } catch (error) {
        console.error("Anomaly Alert Trigger Failed:", error);
    }
};