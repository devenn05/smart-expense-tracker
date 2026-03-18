import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction';

export const generateDashboardAnalytics = async (userId: string) => {
  // 1. Determine Current Month Date Range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // Setting the last day of the month at 23:59:59.999
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // 2. The Aggregation Pipeline
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
              count: { $sum: 1 },
            },
          },
        ],
        // Pipeline B: Calculate Category-wise Expense breakdown
        categoryWise: [
          { $match: { type: 'expense' } }, // Only look at expenses
          {
            $group: {
              _id: '$category', // Group by Category ID
              totalSpent: { $sum: '$amount' },
            },
          },
          // $lookup reaches into the 'categories' collection to grab the Name and Color for the UI
          {
            $lookup: {
              from: 'categories',
              localField: '_id',
              foreignField: '_id',
              as: 'categoryDetails',
            },
          },
          { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } }, // Flattens the resulting array into an object
        ],
        incomeWise: [
          { $match: { type: 'income' } }, 
          { $group: { _id: '$category', totalEarned: { $sum: '$amount' } } },
          { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryDetails' } },
          { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
        ],
        // NEW: Fetch strictly the 5 largest transactions made this month!
        topExpenses: [
          { $match: { type: 'expense' } },
          { $sort: { amount: -1 } }, // Sort descending by amount
          { $limit: 5 }, // Only keep the top 5 biggest chunks!
          { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryDetails' } },
          { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
        ]
      },
    },
  ]);

  let totalIncome = 0; let totalExpense = 0; let transactionCount = 0;

  aggregatedData.totals.forEach((t: any) => {
    if (t._id === 'income') totalIncome = t.totalAmount;
    if (t._id === 'expense') totalExpense = t.totalAmount;
    transactionCount += (t.count || 0);
  });

  const categoryBreakdown = aggregatedData.categoryWise.map((c: any) => ({
    categoryId: c._id, category: c.categoryDetails?.name || 'Uncategorized', color: c.categoryDetails?.color || '#9ca3af', totalSpent: c.totalSpent,
  }));

  let highestIncome = { category: 'No Income', totalEarned: 0, color: '#9ca3af' };
  if(aggregatedData.incomeWise.length > 0){
    const sorted = aggregatedData.incomeWise.sort((a: any,b: any)=> b.totalEarned - a.totalEarned);
    highestIncome = {
       category: sorted[0].categoryDetails?.name || 'Uncategorized', totalEarned: sorted[0].totalEarned, color: sorted[0].categoryDetails?.color || '#10b981'
    };
  }

  const topRecentExpenses = aggregatedData.topExpenses.map((t: any) => ({
      _id: t._id, amount: t.amount, description: t.description || 'No description logged', date: t.date, category: t.categoryDetails?.name || 'Unknown', color: t.categoryDetails?.color || '#f43f5e'
  }));

  const daysPassed = now.getDate() || 1; 
  const totalDays = endOfMonth.getDate();
  const predictedMonthlyExpense = daysPassed > 0 ? (totalExpense / daysPassed) * totalDays : 0;

  return {
    currentMonth: { start: startOfMonth, end: endOfMonth },
    totals: { totalIncome, totalExpense, balance: totalIncome - totalExpense, transactionCount },
    categoryBreakdown,
    highestIncome,
    topRecentExpenses,
    predictions: { predictedMonthlyExpense },
  };
};