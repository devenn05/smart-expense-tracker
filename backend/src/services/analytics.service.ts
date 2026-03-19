import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction';

export const generateDashboardAnalytics = async (userId: string) => {
  // get current month start and end dates
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // run multiple aggregations together using facet
  const [aggregatedData] = await Transaction.aggregate([
    {
      // filter only this user's transactions for current month
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $facet: {
        // total income and expense
        totals: [
          {
            $group: {
              _id: '$type',
              totalAmount: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
        ],

        // expense grouped by category
        categoryWise: [
          { $match: { type: 'expense' } },
          {
            $group: {
              _id: '$category',
              totalSpent: { $sum: '$amount' },
            },
          },
          {
            $lookup: {
              from: 'categories',
              localField: '_id',
              foreignField: '_id',
              as: 'categoryDetails',
            },
          },
          { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
        ],

        // income grouped by category
        incomeWise: [
          { $match: { type: 'income' } },
          { $group: { _id: '$category', totalEarned: { $sum: '$amount' } } },
          {
            $lookup: {
              from: 'categories',
              localField: '_id',
              foreignField: '_id',
              as: 'categoryDetails'
            }
          },
          { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
        ],

        // top 5 biggest expenses
        topExpenses: [
          { $match: { type: 'expense' } },
          { $sort: { amount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'categoryDetails'
            }
          },
          { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
        ]
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpense = 0;
  let transactionCount = 0;

  // extract totals
  aggregatedData.totals.forEach((t: any) => {
    if (t._id === 'income') totalIncome = t.totalAmount;
    if (t._id === 'expense') totalExpense = t.totalAmount;
    transactionCount += (t.count || 0);
  });

  // format category breakdown
  const categoryBreakdown = aggregatedData.categoryWise.map((c: any) => ({
    categoryId: c._id,
    category: c.categoryDetails?.name || 'Uncategorized',
    color: c.categoryDetails?.color || '#9ca3af',
    totalSpent: c.totalSpent,
  }));

  // find highest income category
  let highestIncome = { category: 'No Income', totalEarned: 0, color: '#9ca3af' };

  if (aggregatedData.incomeWise.length > 0) {
    const sorted = aggregatedData.incomeWise.sort(
      (a: any, b: any) => b.totalEarned - a.totalEarned
    );

    highestIncome = {
      category: sorted[0].categoryDetails?.name || 'Uncategorized',
      totalEarned: sorted[0].totalEarned,
      color: sorted[0].categoryDetails?.color || '#10b981'
    };
  }

  // format top expenses
  const topRecentExpenses = aggregatedData.topExpenses.map((t: any) => ({
    _id: t._id,
    amount: t.amount,
    description: t.description || 'No description logged',
    date: t.date,
    category: t.categoryDetails?.name || 'Unknown',
    color: t.categoryDetails?.color || '#f43f5e'
  }));

  // simple prediction based on current spend trend
  const daysPassed = now.getDate() || 1;
  const totalDays = endOfMonth.getDate();
  const predictedMonthlyExpense =
    daysPassed > 0 ? (totalExpense / daysPassed) * totalDays : 0;

  return {
    currentMonth: { start: startOfMonth, end: endOfMonth },
    totals: {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount
    },
    categoryBreakdown,
    highestIncome,
    topRecentExpenses,
    predictions: { predictedMonthlyExpense },
  };
};