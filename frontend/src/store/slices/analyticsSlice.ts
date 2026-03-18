import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { analyticsService } from "../../services/analyticsService";

export interface AnalyticsData {
  totals: { totalIncome: number; totalExpense: number; balance: number; transactionCount: number };
  categoryBreakdown: Array<{ categoryId: string; category: string; color: string; totalSpent: number }>;
  highestIncome: { category: string; totalEarned: number; color: string };
  topRecentExpenses: Array<{ _id: string; amount: number; description: string; date: string; category: string; color: string }>;
  predictions: { predictedMonthlyExpense: number };
  overspending: { 
    status: 'insufficient_data' | 'active'; 
    alerts: Array<{ categoryName: string; currentSpent: number; historicalAverage: number; thresholdLimit: number; message: string }> 
  };
}

interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  data: null,
  isLoading: true,
  error: null,
};

export const fetchAnalytics = createAsyncThunk("analytics/fetchData", async (_, thunkAPI) => {
  try {
    const res = await analyticsService.getAnalysis();
    // Your backend sends { success: true, data: { totals, categoryBreakdown... } }
    return res.data; 
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error?.response?.data?.message || "Failed to fetch analytics");
  }
});

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload; // Store the beautiful aggregated package!
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default analyticsSlice.reducer;