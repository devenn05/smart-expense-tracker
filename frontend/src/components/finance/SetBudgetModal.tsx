import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../../store/store';
import { setBudget, fetchBudget } from '../../store/slices/financeSlice';
import { budgetSchema, type BudgetForm } from '../../utils/validations';

export const SetBudgetModal = ({ onClose }: { onClose: () => void }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // We need the categories to populate our dropdown menu!
  const categories =useSelector((state: RootState) => state.finance?.categories) ?? [];

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({resolver: zodResolver(budgetSchema),});
  const onSubmit = async (data: BudgetForm) => {
    try {
      await dispatch(setBudget(data)).unwrap();
      // Instantly refetch populated budgets so the UI updates
      dispatch(fetchBudget());
      onClose();
    } catch (error) {
      alert(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Select Category: </label>
        <select {...register('category')}>
          <option value="">-- Choose Category --</option>
          {(categories ?? []).map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name} {cat.isPredefined ? '(Default)' : ''}
            </option>
          ))}
        </select>
        {errors.category && <p style={{ color: 'red' }}>{errors.category.message}</p>}
      </div>

      <div style={{ marginTop: '10px' }}>
        <label>Monthly Limit: $ </label>
        <input type="number" step="0.01" {...register('amount')} />
        {errors.amount && <p style={{ color: 'red' }}>{errors.amount.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} style={{ marginTop: '15px' }}>
        {isSubmitting ? 'Saving...' : 'Set Budget'}
      </button>
    </form>
  );
};

