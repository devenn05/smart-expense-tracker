import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../../store/store';
import { addTransaction } from '../../store/slices/transactionSlice';
import { transactionFormSchema, type TransactionForm } from '../../utils/validations';
import { Loader2, DollarSign, CalendarIcon, PenLine } from 'lucide-react';

export const AddTransactionModal = ({ onClose }: { onClose: () => void }) => {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector((state: RootState) => state.finance?.categories) ?? [];

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<TransactionForm>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: { 
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: ''
    }
  });

  // Watch the type so we can color coordinate (Expense = Red, Income = Green)
  const currentType = watch("type");
  const isIncome = currentType === 'income';
  const colorRingClass = isIncome ? 'focus:border-emerald-500 focus:ring-emerald-500' : 'focus:border-rose-500 focus:ring-rose-500';
  const buttonClass = isIncome ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' : 'bg-brand-600 hover:bg-brand-700 focus:ring-brand-500';

  const onSubmit = async (data: TransactionForm) => {
    try {
      await dispatch(addTransaction(data)).unwrap();
      onClose();
    } catch (error) {
      alert(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 2-Column Grid for Type & Date */}
      <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</label>
            <select 
                {...register('type')}
                className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium ${isIncome ? 'text-emerald-700' : 'text-rose-700'} outline-none focus:ring-1 ${colorRingClass} transition-colors`}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            {errors.type && <p className="mt-1 text-xs text-rose-500">{errors.type.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date</label>
            <div className="relative">
                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="date" 
                    {...register('date')} 
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:ring-1 ${colorRingClass} transition-colors`}
                />
            </div>
            {errors.date && <p className="mt-1 text-xs text-rose-500">{errors.date.message}</p>}
          </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Amount</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className={`h-4 w-4 ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`} />
            </div>
            <input 
                type="number" 
                step="0.01" 
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })} 
                className={`block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold text-slate-900 outline-none focus:ring-1 ${colorRingClass} transition-colors`}
            />
        </div>
        {errors.amount && <p className="mt-1 text-xs text-rose-500">{errors.amount.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</label>
        <select 
            {...register('category')}
            className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:ring-1 ${colorRingClass} transition-colors`}
        >
          <option value="">-- Select Category --</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-xs text-rose-500">{errors.category.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description (Optional)</label>
        <div className="relative">
            <PenLine className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input 
                type="text" 
                placeholder="Coffee, Groceries, Salary, etc."
                {...register('description')} 
                className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:ring-1 ${colorRingClass} transition-colors`}
            />
        </div>
        {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description.message}</p>}
      </div>

      <div className="pt-3">
        <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-bold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 transition-colors ${buttonClass}`}
        >
          {isSubmitting ? (
             <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
          ) : `Add ${isIncome ? 'Income' : 'Expense'}`}
        </button>
      </div>
    </form>
  );
};