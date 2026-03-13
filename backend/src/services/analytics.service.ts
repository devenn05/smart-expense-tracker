import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction';

export const generateDashboardAnalytics = async (userId: string) => {
  // 1. Determine Current Month Date Range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // Setting the last day of the month at 23:59:59.999
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // 2. The Mighty Aggregation Pipeline
  // $facet allows us to run multiple different mathematical groups at the EXACT same time!
  const [aggregatedData] = await Transaction.aggregate([
    {
      // Match 1: ONLY look at this user's transactions for the CURRENT month
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $facet: {
        // Pipeline A: Calculate Total Income & Expense
        totals: [
          {
            $group: {
              _id: '$type', // Group by 'income' or 'expense'
              totalAmount: { $sum: '$amount' }, // Add them all up!
            },
          },
        ],
        // Pipeline B: Calculate Category-wise Expense breakdown for Pie Charts!
        categoryWise: [
          { $match: { type: 'expense' } }, // Only look at expenses
          {
            $group: {
              _id: '$category', // Group by Category ID
              totalSpent: { $sum: '$amount' },
            },
          },
          // $lookup reaches into the 'categories' collection to grab the Name and Color for the UI!
          {
            $lookup: {
              from: 'categories',
              localField: '_id',
              foreignField: '_id',
              as: 'categoryDetails',
            },
          },
          { $unwind: '$categoryDetails' }, // Flattens the resulting array into an object
        ],
      },
    },
  ]);

  // 3. Format the Results
  let totalIncome = 0;
  let totalExpense = 0;

  aggregatedData.totals.forEach((t: any) => {
    if (t._id === 'income') totalIncome = t.totalAmount;
    if (t._id === 'expense') totalExpense = t.totalAmount;
  });

  const categoryBreakdown = aggregatedData.categoryWise.map((c: any) => ({
    category: c.categoryDetails.name,
    color: c.categoryDetails.color,
    totalSpent: c.totalSpent,
  }));

  // 4. Implemented Monthly Expense Prediction Logic
  // Formula: (Current Spending / Days Passed in Month) * Total Days in Month
  const daysPassed = now.getDate() || 1; // || 1 prevents dividing by zero on the 1st of the month
  const totalDays = endOfMonth.getDate();
  
  let predictedMonthlyExpense = 0;
  if (daysPassed > 0) {
    predictedMonthlyExpense = (totalExpense / daysPassed) * totalDays;
  }

  // 5. Send back the beautifully calculated package to React
  return {
    currentMonth: {
      start: startOfMonth,
      end: endOfMonth,
    },
    totals: {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    },
    categoryBreakdown,
    predictions: {
      predictedMonthlyExpense,
    },
  };
};