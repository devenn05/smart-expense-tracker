import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../store/store';
import { fetchAnalytics } from '../store/slices/analyticsSlice';
import { 
  PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  Wallet, TrendingUp, TrendingDown, Activity, BarChart3, 
  BellRing, Sparkles, Loader2, Calculator, BrainCircuit, 
  Columns3, ReceiptText, ShieldAlert 
} from 'lucide-react';

export const Dashboard = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { data, isLoading } = useSelector((state: RootState) => state.analytics);

    useEffect(() => {
        dispatch(fetchAnalytics());
    }, [dispatch]);

    const currentMonthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    if (isLoading || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
                <p className="font-medium animate-pulse">Compiling financial algorithms...</p>
            </div>
        )
    }

    const { totals, categoryBreakdown, highestIncome, topRecentExpenses, overspending, predictions } = data;

    // ----- FORECASTING MATH -----
    const now = new Date();
    const daysPassed = Math.max(1, now.getDate()); 
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - daysPassed;

    const currentDailyAverage = totals.totalExpense / daysPassed;
    const projectedFinalBalance = totals.totalIncome - predictions.predictedMonthlyExpense;
    
    // How much they can safely spend per day to not dip into negatives by the month's end.
    const safeDailyLimit = daysRemaining > 0 ? Math.max(0, (totals.totalIncome - totals.totalExpense) / daysRemaining) : 0;
    
    // Find the highest and most draining expense categories for our bar charts and warnings
    const sortedCategories = [...categoryBreakdown].sort((a,b) => b.totalSpent - a.totalSpent).filter(c => c.totalSpent > 0);
    const highestDrainCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

    const formatCurrency = (val: number) => `₹${(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return(
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* -- Dashboard Header -- */}
            <div className="sm:flex sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Command Center</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Active Profile: <span className="font-semibold text-slate-700">{user?.name}</span>
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-3">
                    <div className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700">
                        <Activity className="w-4 h-4 mr-2 text-brand-500" />
                        {currentMonthYear} Analysis
                    </div>
                </div>
            </div>

            {/* --- Level 1: Core KPI Cards --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                        <Wallet className="w-24 h-24 text-slate-900" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-slate-500 mb-1">Current Balance</p>
                        <h3 className={`text-3xl font-extrabold tracking-tight ${totals.balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                            {formatCurrency(totals.balance)}
                        </h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp className="w-24 h-24 text-emerald-900" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Verified Income</p>
                        <h3 className="text-3xl font-extrabold text-emerald-600 tracking-tight">{formatCurrency(totals.totalIncome)}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                        <TrendingDown className="w-24 h-24 text-rose-900" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Operating Expenses</p>
                        <h3 className="text-3xl font-extrabold text-rose-600 tracking-tight">{formatCurrency(totals.totalExpense)}</h3>
                    </div>
                </div>
            </div>

            {/* --- Level 2: Quick Highlights (Total Txs, Max Expense, Max Income) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-brand-50/50 rounded-xl p-5 border border-brand-100/60 flex items-center justify-between">
                     <div>
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Activities</p>
                         <h4 className="text-2xl font-black text-brand-700">{totals.transactionCount} <span className="text-sm text-brand-600/60 font-medium tracking-normal">Logged Entries</span></h4>
                     </div>
                     <ReceiptText className="w-10 h-10 text-brand-300 opacity-60" />
                 </div>
                 <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100/60 flex items-center justify-between">
                     <div>
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Max Expense Source</p>
                         <h4 className="text-xl font-bold text-amber-700">{highestDrainCategory ? highestDrainCategory.category : 'N/A'}</h4>
                         {highestDrainCategory && <p className="text-xs font-semibold text-amber-600 opacity-80 mt-0.5">{formatCurrency(highestDrainCategory.totalSpent)}</p>}
                     </div>
                 </div>
                 <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-100/60 flex items-center justify-between">
                     <div>
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Top Income Driver</p>
                         <h4 className="text-xl font-bold text-emerald-700">{highestIncome?.category || 'N/A'}</h4>
                         {highestIncome?.totalEarned > 0 && <p className="text-xs font-semibold text-emerald-600 opacity-80 mt-0.5">{formatCurrency(highestIncome.totalEarned)}</p>}
                     </div>
                 </div>
            </div>

            {/* --- Level 3: Visualization Grid! (Pie AND Bar side by side!) --- */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[420px]">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50 rounded-t-2xl"><BarChart3 className="w-5 h-5 text-indigo-500" /><h3 className="text-base font-semibold text-slate-800">Visual Spend Dispersion (Bar)</h3></div>
                    <div className="flex-1 p-6 pb-2 pr-8">
                        {sortedCategories.length > 0 ? (
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={sortedCategories}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} width={50} />
                                <Tooltip 
  cursor={{ fill: '#f1f5f9' }} 
  formatter={(val: any) => [formatCurrency(Number(val) || 0), "Spent"]} 
  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} 
/>
                                <Bar dataKey="totalSpent" radius={[6, 6, 0, 0]}>
                                  {sortedCategories.map((entry, index) => (<Cell key={`bar-${index}`} fill={entry.color} />))}
                                </Bar>
                              </BarChart>
                           </ResponsiveContainer>
                        ) : (<div className="h-full flex flex-col gap-2 items-center justify-center text-slate-400 font-medium"> <BarChart3 className="w-12 h-12 stroke-1 opacity-50"/> No expenses mapped yet.</div>)}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[420px]">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50 rounded-t-2xl"><RechartsPie className="w-5 h-5 text-indigo-500" /><h3 className="text-base font-semibold text-slate-800">Categorical Slices (Pie)</h3></div>
                    <div className="flex-1 p-6">
                        {sortedCategories.length > 0 ? (
                             <ResponsiveContainer width="100%" height="100%">
                                <RechartsPie>
                                    <Pie data={sortedCategories} dataKey="totalSpent" nameKey="category" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} >
                                        {sortedCategories.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color || '#9ca3af'} /> ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ borderRadius: '12px' }}/>
                                    <Legend verticalAlign="bottom" height={20}/>
                                </RechartsPie>
                             </ResponsiveContainer>
                        ) : (<div className="h-full flex items-center justify-center text-slate-400 font-medium">Graph Engine Waiting on Inputs</div>)}
                    </div>
                </div>
            </div>

            {/* --- Level 4: Top 5 Recent Feed & Overspending Alerts --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left side: NEW Top 5 massive transactions feed */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/80 rounded-t-2xl">
                        <Columns3 className="w-5 h-5 text-slate-500" />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Top 5 Largest Transactions</h3>
                    </div>
                    <div className="flex-1 flex flex-col divide-y divide-slate-50 p-1.5 overflow-y-auto min-h-[300px] max-h-[350px]">
                        {(!topRecentExpenses || topRecentExpenses.length === 0) ? (
                           <div className="flex flex-col flex-1 items-center justify-center text-center p-6 text-slate-400">
                               <ReceiptText className="w-10 h-10 opacity-30 mb-2"/>
                               <p className="text-sm font-medium">Ledger requires fresh metrics.</p>
                           </div>
                        ) : topRecentExpenses.map((exp, i) => (
                            <div key={i} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors rounded-xl">
                               <div className="flex flex-col gap-0.5 max-w-[65%]">
                                   <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: exp.color }} />
                                        <p className="font-bold text-slate-800 text-sm truncate">{exp.category}</p>
                                   </div>
                                   <p className="text-xs text-slate-500 ml-4 truncate" title={exp.description}>{exp.description || 'No Description'}</p>
                                   <p className="text-[10px] font-bold uppercase text-slate-400 ml-4 mt-0.5 tracking-widest">{new Date(exp.date).toLocaleDateString()}</p>
                               </div>
                               <span className="font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md text-sm border border-rose-100">
                                   - {formatCurrency(exp.amount)}
                               </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Existing Smart Alerts */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between bg-rose-50/40 rounded-t-2xl border-t-2 border-t-rose-400">
                        <div className="flex items-center gap-2">
                            <BellRing className="w-5 h-5 text-rose-500 animate-pulse" />
                            <h3 className="text-sm font-semibold text-rose-900 uppercase tracking-widest">Spending Alerts</h3>
                        </div>
                    </div>
                    
                    <div className="p-4 flex-1 space-y-4 overflow-y-auto max-h-[350px]">
                        {overspending.status === 'insufficient_data' && (
                             <div className="text-center p-4 border border-slate-100 rounded-xl bg-slate-50 mt-4">
                                <p className="text-sm font-medium text-slate-600">Gathering Intelligence 🧠</p>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">Our engine needs at least one previous month of expense data to properly model anomaly thresholds against you.</p>
                             </div>
                        )}

                        {overspending.status === 'active' && overspending.alerts.length === 0 && (
                             <div className="text-center p-6 border border-emerald-100 rounded-xl bg-emerald-50 mt-4 text-emerald-700">
                                 <ShieldAlert className="w-8 h-8 text-emerald-300 mx-auto mb-2 opacity-50" />
                                 <h4 className="font-bold text-sm">Perfect Financial Health</h4>
                                 <p className="text-xs mt-1 font-medium opacity-80 leading-relaxed">No abnormal spending patterns detected. You are securely inside your standard historic thresholds.</p>
                             </div>
                        )}

                        {overspending.alerts?.map((alert, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm relative overflow-hidden group hover:border-rose-200 transition-colors">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                                <div className="pl-2">
                                    <h4 className="text-sm font-bold text-slate-900 capitalize mb-1">{alert.categoryName} Disruption</h4>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        You spent <strong>{formatCurrency(alert.currentSpent)}</strong>, strictly exceeding your standard historical deviation ({formatCurrency(alert.historicalAverage)}) dangerously.
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* ----- NEW: FORECASTING & BEHAVIORAL INTELLIGENCE MODULE ----- */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-xl overflow-hidden relative border border-indigo-500/30">
    {/* Techy background textures */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

    <div className="relative z-10 px-6 sm:px-8 py-6 border-b border-white/10 flex items-center justify-between">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-lg">
                <BrainCircuit className="w-6 h-6 text-brand-300" />
             </div>
             <h2 className="text-xl font-bold text-white tracking-wide">Smart Spending Forecast</h2>
         </div>
         <Sparkles className="w-5 h-5 text-indigo-400 opacity-60 hidden sm:block animate-pulse" />
    </div>

    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
        
        {/* Prediction Stat Block */}
        <div className="p-6 sm:p-8 hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-2 mb-2 opacity-80">
               <TrendingUp className="w-4 h-4 text-brand-300" />
               <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-200">Where you're heading</h4>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tight mb-2 flex items-baseline gap-2">
                 {formatCurrency(predictions.predictedMonthlyExpense)}
                 {predictions.predictedMonthlyExpense > totals.totalExpense && (
                    <span className="text-sm font-medium text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded flex items-center gap-1 border border-amber-500/30 -translate-y-1">
                        Predicted Expenses
                    </span>
                 )}
            </h3>
            
            <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-slate-300 leading-relaxed font-medium">
                <div className="flex items-center gap-2 mb-1.5 opacity-60 text-xs">
                    <Calculator className="w-3.5 h-3.5" /> Quick Math
                </div>
                You spend about <strong className="text-white">₹{currentDailyAverage.toFixed(0)} per day</strong>. If you keep this pace for the <strong className="text-white">{daysInMonth} days</strong> left in the month, here is your result.
            </div>
        </div>

        {/* Behavior Trajectory Analysis */}
        <div className="p-6 sm:p-8 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-2 mb-2 opacity-80">
               <Activity className="w-4 h-4 text-emerald-300" />
               <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-200">Daily Speed Limit</h4>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tight mb-1">
                {formatCurrency(safeDailyLimit)} <span className="text-sm font-medium text-slate-400 uppercase tracking-wide opacity-80 ml-1"> / Day left</span>
            </h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4 mt-2">
                To stay in the green, try not to spend more than this amount for the next <span className="text-slate-200 font-bold">{daysRemaining} days</span>.
            </p>
            
            {daysRemaining > 0 && highestDrainCategory ? (
                 <div className="flex items-start gap-3 mt-auto border-t border-white/10 pt-4">
                    <div className="p-1.5 rounded-md mt-0.5 bg-rose-500/20 text-rose-300">
                         <TrendingDown className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-medium text-slate-300 leading-relaxed">
                        Heads up: <span className="text-white font-bold">{highestDrainCategory.category}</span> is the main reason your savings are dropping at {formatCurrency(highestDrainCategory.totalSpent)}.
                    </p>
                 </div>
            ) : (
                 <p className="text-xs text-emerald-300 border-t border-white/10 pt-4 opacity-80 font-semibold tracking-wide flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> Your spending habits look great right now!
                 </p>
            )}
        </div>

        {/* Ending Liquidity Snapshot */}
        <div className="p-6 sm:p-8 hover:bg-white/5 transition-colors flex flex-col justify-center bg-indigo-950/20 relative">
            <div className="absolute right-4 top-4 bg-brand-500 w-2 h-2 rounded-full animate-ping opacity-70"></div>
            <div className="absolute right-4 top-4 bg-brand-500 w-2 h-2 rounded-full"></div>

            <div className="flex items-center gap-2 mb-2 opacity-80">
               <Wallet className="w-4 h-4 text-purple-300" />
               <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-200">Final Savings Goal</h4>
            </div>
            
            <div className={`mt-2 flex items-baseline text-4xl sm:text-5xl font-extrabold tracking-tighter ${projectedFinalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                 {projectedFinalBalance > 0 && '+'}{formatCurrency(projectedFinalBalance)}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-300 font-medium">
                {projectedFinalBalance >= 0 ? (
                    <>If you stick to your current habits, this is the "bonus" amount that will move <strong className="text-white font-bold tracking-wide">straight into your savings</strong> when the month ends.</>
                ) : (
                    <>You're on track to spend more than you have. <span className="text-rose-200 font-bold">Try cutting back on non-essentials today to avoid a zero balance.</span> </> 
                )}
            </p>
        </div>
    </div>
</div>
            
        </div>
    )
}