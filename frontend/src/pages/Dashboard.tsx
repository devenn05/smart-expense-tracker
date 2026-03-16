import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../store/store';
import { fetchAnalytics } from '../store/slices/analyticsSlice';
import { Link } from 'react-router-dom';
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Activity, BarChart3, BellRing, Sparkles, Loader2 } from 'lucide-react';

export const Dashboard = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    
    // Grab the new data from Redux!
    const { data, isLoading } = useSelector((state: RootState) => state.analytics);

    useEffect(() => {
        dispatch(fetchAnalytics());
    }, [dispatch]);

    const currentMonthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    if (isLoading || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
                <p className="font-medium animate-pulse">Compiling your financial data...</p>
            </div>
        )
    }

    const { totals, categoryBreakdown, overspending, predictions } = data;

    // Currency Formatter Helper
    const formatCurrency = (val: number) => `₹${(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    return(
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* -- Dashboard Header -- */}
            <div className="sm:flex sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>. Here is your financial overview.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-3">
                    <div className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700">
                        <Activity className="w-4 h-4 mr-2 text-brand-500" />
                        {currentMonthYear}
                    </div>
                </div>
            </div>

            {/* -- Top Metrics Level -- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Balance Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                        <Wallet className="w-24 h-24 text-slate-900" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-slate-500 mb-1">Remaining Balance</p>
                        {/* Dynamic Coloring for Balance (Red if negative, Black if positive) */}
                        <h3 className={`text-3xl font-extrabold tracking-tight ${totals.balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                            {formatCurrency(totals.balance)}
                        </h3>
                    </div>
                </div>

                {/* Income Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp className="w-24 h-24 text-emerald-900" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Income</p>
                        <h3 className="text-3xl font-extrabold text-emerald-600 tracking-tight">{formatCurrency(totals.totalIncome)}</h3>
                        <p className="text-xs font-medium text-emerald-600/70 mt-2 bg-emerald-50 w-max px-2 py-0.5 rounded">This Month</p>
                    </div>
                </div>

                {/* Expense Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                        <TrendingDown className="w-24 h-24 text-rose-900" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Expenses</p>
                        <h3 className="text-3xl font-extrabold text-rose-600 tracking-tight">{formatCurrency(totals.totalExpense)}</h3>
                        {/* Smart AI Prediction from your Backend */}
                        {predictions.predictedMonthlyExpense > totals.totalExpense && (
                           <p className="text-xs font-medium text-amber-600 mt-2 flex items-center bg-amber-50 w-max px-2 py-0.5 rounded">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Predicted Total: {formatCurrency(predictions.predictedMonthlyExpense)}
                           </p> 
                        )}
                    </div>
                </div>
            </div>

            {/* -- Analytics Section Layout -- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Chart Area */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[400px]">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-brand-500" />
                            <h3 className="text-lg font-semibold text-slate-800">Monthly Spending Breakdown</h3>
                        </div>
                    </div>
                    
                    <div className="flex-1 p-6">
                        {categoryBreakdown.length > 0 ? (
                            <div className="w-full h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPie>
                                        <Pie 
                                            data={categoryBreakdown} 
                                            dataKey="totalSpent" 
                                            nameKey="category" 
                                            cx="50%" 
                                            cy="50%" 
                                            innerRadius={80}
                                            outerRadius={120} 
                                            paddingAngle={4}
                                        >
                                            {/* We strictly use the database colors linked to each category! */}
                                            {categoryBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color || '#9ca3af'} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </RechartsPie>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col justify-center items-center text-slate-400 space-y-4 min-h-[300px]">
                                <Activity className="w-12 h-12 stroke-1" />
                                <p className="text-sm font-medium">No expenses recorded for this month.</p>
                                <Link to="/transactions" className="text-sm text-brand-600 font-semibold hover:underline">Add an expense to generate charts</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Overspending Alerts (From Insight Backend Service!) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50 rounded-t-2xl border-t-2 border-t-rose-400">
                        <div className="flex items-center gap-2">
                            <BellRing className="w-5 h-5 text-rose-500 animate-pulse" />
                            <h3 className="text-base font-semibold text-rose-900">Overspending Alerts</h3>
                        </div>
                    </div>
                    
                    <div className="p-4 flex-1 space-y-4 overflow-y-auto max-h-[350px]">
                        {overspending.status === 'insufficient_data' && (
                             <div className="text-center p-4 border border-slate-100 rounded-xl bg-slate-50 mt-4">
                                <p className="text-sm font-medium text-slate-600">Gathering Intelligence 🧠</p>
                                <p className="text-xs text-slate-500 mt-2">Our system needs a few days of transaction history to build your predictive spending model.</p>
                             </div>
                        )}

                        {overspending.status === 'active' && overspending.alerts.length === 0 && (
                             <div className="text-center p-6 border border-emerald-100 rounded-xl bg-emerald-50 mt-4 text-emerald-700">
                                 <h4 className="font-bold text-sm">Perfect Financial Health!</h4>
                                 <p className="text-xs mt-1 font-medium">You have not significantly exceeded any historical averages this month.</p>
                             </div>
                        )}

                        {overspending.alerts?.map((alert, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm relative overflow-hidden group hover:border-rose-200 transition-colors">
                                {/* Thin accent bar on the left */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                                <div className="pl-2">
                                    <h4 className="text-sm font-bold text-slate-900 capitalize mb-1">{alert.categoryName} Anomalies</h4>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        You spent <strong>{formatCurrency(alert.currentSpent)}</strong>, which exceeds your typical {formatCurrency(alert.historicalAverage)} limit by a heavy margin.
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}