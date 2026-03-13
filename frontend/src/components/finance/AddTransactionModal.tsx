import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../../store/store';
import { addTransaction } from '../../store/slices/transactionSlice';
import { transactionFormSchema, type TransactionForm } from '../../utils/validations';

export const AddTransactionModal = ({ onClose }: { onClose: () => void }) => {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector((state: RootState) => state.finance?.categories) ?? [];

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TransactionForm>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: { 
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: ''
    } // Provided exact mapped string state so selecting defaults actually validates!
  });

  const onSubmit = async (data: TransactionForm) => {
    try {
      await dispatch(addTransaction(data)).unwrap();
      onClose();
    } catch (error) {
      alert(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <label>Type: </label>
        <select {...register('type')}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        {errors.type && <span style={{color:'red'}}>{errors.type.message}</span>}
      </div>

      {/* The rest is visually the same down from here! */}
      <div>
        <label>Amount: $</label>
        <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
        {errors.amount && <span style={{color:'red'}}>{errors.amount.message}</span>}
      </div>

      <div>
        <label>Category: </label>
        <select {...register('category')}>
          <option value="">-- Choose Category --</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        {errors.category && <span style={{color:'red'}}>{errors.category.message}</span>}
      </div>

      <div>
        <label>Date: </label>
        <input type="date" {...register('date')} />
        {errors.date && <span style={{color:'red'}}>{errors.date.message}</span>}
      </div>

      <div>
        <label>Description: </label>
        <input type="text" {...register('description')} />
        {errors.description && <span style={{color:'red'}}>{errors.description.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting} style={{ marginTop: '10px' }}>
        {isSubmitting ? 'Saving...' : 'Add Transaction'}
      </button>
    </form>
  );
};