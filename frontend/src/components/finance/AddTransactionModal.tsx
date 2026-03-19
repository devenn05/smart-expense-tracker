import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../../store/store';
import {
  addTransaction,
  editTransaction,
  type Transaction,
} from '../../store/slices/transactionSlice';
import {
  transactionFormSchema,
  type TransactionForm,
} from '../../utils/validations';
import { Loader2, IndianRupee, CalendarIcon, PenLine } from 'lucide-react';

export const AddTransactionModal = ({
  onClose,
  initialData,
}: {
  onClose: () => void;
  initialData?: Transaction | null;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isEditMode = !!initialData;

  // get categories from store
  const categories =
    useSelector((state: RootState) => state.finance?.categories) ?? [];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionFormSchema),
    // pre-fill form if editing
    defaultValues: isEditMode
      ? {
          amount: initialData.amount,
          type: initialData.type,
          category: initialData.category._id,
          description: initialData.description,
          // convert date to input format (yyyy-mm-dd)
          date: new Date(initialData.date).toISOString().split('T')[0],
        }
      : {
          date: new Date().toISOString().split('T')[0],
          type: 'expense',
          category: '',
        },
  });

  const currentType = watch('type');

  // filter categories based on selected type (income/expense)
  const filteredCategories = categories.filter((c) => c.type === currentType);

  const onSubmit = async (data: TransactionForm) => {
    try {
      if (isEditMode) {
        await dispatch(editTransaction({ id: initialData._id, data })).unwrap();
        toast.success("Transaction updated successfully!");
      } else {
        await dispatch(addTransaction(data)).unwrap();
        toast.success("Transaction recorded!");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Type
          </label>
          <select {...register('type')} className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm font-medium outline-none">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Date
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input type="date" {...register('date')} className="w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-sm outline-none" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Amount
        </label>
        <div className="relative">
          <IndianRupee className="absolute left-3 top-4 h-4 w-4 text-slate-400" />
          <input
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
            className="block w-full pl-9 py-2.5 bg-slate-50 border rounded-lg text-lg font-bold"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Category
        </label>
        <select {...register('category')} className="w-full px-3 py-2.5 bg-slate-50 border rounded-lg text-sm outline-none">
          <option value="">-- Select Category --</option>
          {filteredCategories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {errors.category && <p className="mt-1 text-xs text-rose-500">{errors.category.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          Description
        </label>
        <div className="relative">
          <PenLine className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input type="text" {...register('description')} className="w-full pl-9 py-2.5 bg-slate-50 border rounded-lg text-sm outline-none" />
        </div>
      </div>

      <div className="pt-3">
        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg text-sm disabled:opacity-70 transition-colors">
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
          ) : isEditMode ? (
            'Update Record'
          ) : (
            'Save Record'
          )}
        </button>
      </div>
    </form>
  );
};