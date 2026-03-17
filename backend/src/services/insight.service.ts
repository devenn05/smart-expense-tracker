import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction.js';

export const detectOverspending = async (userId: string, currentCategorySpending: any[]) => {
  const now = new Date();
  
  // Calculate Exact 3-Month Window
  const startOfHistory = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const endOfHistory = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // Aggregation Pipeline to Group By Month, Then Average
  const history = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        date: { $gte: startOfHistory, $lte: endOfHistory },
      },
    },
    // Step 1: Group by specific Category AND Month
    {
      $group: {
        _id: { category: '$category', month: { $month: '$date' }, year: { $year: '$date' } },
        monthlyTotal: { $sum: '$amount' },
      },
    },
    // Step 2: Re-group strictly by Category to average out the months found
    {
      $group: {
        _id: '$_id.category',
        historicalAverage: { $avg: '$monthlyTotal' },
        monthsOfData: { $sum: 1 },
      },
    },
  ]);

  // If NO history exists AT ALL, trigger the global insufficient flag.
  if (history.length === 0) {
    return { status: 'insufficient_data', alerts: [] };
  }

  // If history exists, let's find the over-spenders!
  const alerts: any[] = [];

  currentCategorySpending.forEach((currentMonth) => {
    // Match the current month's spending to the historical pipeline data
    const categoryHistory = history.find(h => h._id.toString() === currentMonth.categoryId.toString());

    if (categoryHistory) {
      const average = categoryHistory.historicalAverage;
      
      // The Overspending Detection Rule (40% more than average)
      const threshold = average * 1.4;

      if (currentMonth.totalSpent > threshold) {
        alerts.push({
          categoryId: currentMonth.categoryId,
          categoryName: currentMonth.category,
          status: 'overspending',
          currentSpent: currentMonth.totalSpent,
          historicalAverage: average,
          thresholdLimit: threshold,
          message: `You are spending significantly more on ${currentMonth.category} this month compared to your previous spending pattern.`
        });
      }
    }
  });

  return { status: 'active', alerts };
};