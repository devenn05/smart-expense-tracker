import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../../store/store';
import { setBudget, fetchBudget } from '../../store/slices/financeSlice';
import { budgetSchema, type BudgetForm } from '../../utils/validations';
import { Loader2, DollarSign } from 'lucide-react';

export const SetBudgetModal = ({ onClose }: { onClose: () => void }) => {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector((state: RootState) => state.finance?.categories) ?? [];

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
      resolver: zodResolver(budgetSchema),
  });

  const onSubmit = async (data: BudgetForm) => {
    try {
      await dispatch(setBudget(data)).unwrap();
      dispatch(fetchBudget());
      onClose();
    } catch (error) {
      alert(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Target Category</label>
        <select 
            {...register('category')}
            className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
        >
          <option value="">-- Choose Category --</option>
          {(categories ?? []).map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name} {cat.isPredefined ? '(Default)' : ''}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.category.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Spending Limit</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-slate-400" />
            </div>
            <input 
                type="number" 
                step="0.01" 
                placeholder="0.00"
                {...register('amount')} 
                className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
            />
        </div>
        {errors.amount && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.amount.message}</p>}
      </div>

      <div className="pt-2">
        <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-all"
        >
          {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Budget...</>
          ) : 'Save Limit'}
        </button>
      </div>
    </form>
  );
};