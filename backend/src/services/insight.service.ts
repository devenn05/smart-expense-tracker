import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction';

export const detectOverspending = async (userId: string, currentCategorySpending: any[]) => {
  const now = new Date();

  // last 3 months range (excluding current month)
  const startOfHistory = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const endOfHistory = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // get average monthly spend per category
  const history = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        date: { $gte: startOfHistory, $lte: endOfHistory },
      },
    },
    {
      // group by category + month
      $group: {
        _id: {
          category: '$category',
          month: { $month: '$date' },
          year: { $year: '$date' }
        },
        monthlyTotal: { $sum: '$amount' },
      },
    },
    {
      // calculate average per category
      $group: {
        _id: '$_id.category',
        historicalAverage: { $avg: '$monthlyTotal' },
        monthsOfData: { $sum: 1 },
      },
    },
  ]);

  // if no past data, skip detection
  if (history.length === 0) {
    return { status: 'insufficient_data', alerts: [] };
  }

  const alerts: any[] = [];

  // compare current spending with history
  currentCategorySpending.forEach((currentMonth) => {
    const categoryHistory = history.find(
      h => h._id.toString() === currentMonth.categoryId.toString()
    );

    if (categoryHistory) {
      const average = categoryHistory.historicalAverage;

      // threshold = 40% higher than average
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