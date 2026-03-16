import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../../store/store';
import { setBudget, fetchBudget, type Budget } from '../../store/slices/financeSlice';
import { budgetSchema, type BudgetForm } from '../../utils/validations';
import { Loader2, IndianRupee } from 'lucide-react';

export const SetBudgetModal = ({ onClose, initialData }: { onClose: () => void; initialData?: Budget | null }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isEditMode = !!initialData;
  const categories = useSelector((state: RootState) => state.finance?.categories) ?? [];
  
  // STRICT RULE UI Filter: Only Expense categories allowed!
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
      resolver: zodResolver(budgetSchema),
      defaultValues: isEditMode ? { category: initialData.category._id, amount: initialData.amount } : {}
  });

  const onSubmit = async (data: BudgetForm) => {
    try {
      await dispatch(setBudget(data)).unwrap();
      toast.success("Budget limit set successfully!"); 
      dispatch(fetchBudget());
      onClose();
    } catch (error: any) { toast.error(error.message || error); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Target Category</label>
        {/* If editing, freeze the select box so they only change the amount */}
        <select {...register('category')} disabled={isEditMode} className="block w-full px-3 py-2.5 bg-slate-50 border rounded-lg text-sm outline-none transition-all disabled:opacity-50">
          <option value="">-- Choose Category --</option>
          {expenseCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name} {cat.isPredefined ? '(Default)' : ''}</option>
          ))}
        </select>
        {errors.category && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.category.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Spending Limit</label>
        <div className="relative">
            <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm outline-none transition-all" />
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 transition-all">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditMode ? 'Update Limit' : 'Save Limit'}
        </button>
      </div>
    </form>
  );
};