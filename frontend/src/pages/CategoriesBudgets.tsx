import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../store/store';
import { fetchCategories, fetchBudget } from '../store/slices/financeSlice';
import { Modal } from '../components/common/Modal';
import { AddCategoryModal } from '../components/finance/AddCategoryModal';
import { SetBudgetModal } from '../components/finance/SetBudgetModal';

export const CategoriesBudgets = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, budgets, isLoading } = useSelector((state: RootState) => state.finance);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Fetch data immediately when the user visits this page
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBudget());
  }, [dispatch]);

  if (isLoading) return <p>Loading financial data...</p>;

  return (
    <div>
      <h2>Manage Finances</h2>

      {/* -- Categories Section -- */}
      <section style={{ border: '1px solid gray', padding: '10px', marginBottom: '20px' }}>
        <h3>Categories <button onClick={() => setIsCategoryModalOpen(true)}>+ Add Custom</button></h3>
        <ul>
          {(categories ?? []).map((c) => (
            <li key={c._id} style={{ color: c.color }}>
              {c.name} {c.isPredefined ? '🔒 (Default)' : '✏️ (Custom)'}
            </li>
          ))}
        </ul>
      </section>

      {/* -- Budgets Section -- */}
      <section style={{ border: '1px solid gray', padding: '10px' }}>
        <h3>Monthly Budgets <button onClick={() => setIsBudgetModalOpen(true)}>+ Set Budget</button></h3>
        <ul>
          {(budgets ?? []).map((b) => (
            <li key={b._id}>
              {/* Uses optional chaining just in case population is pending */}
              <strong>{b.category?.name || 'Loading...'}:</strong> ${b.amount}
            </li>
          ))}
          {budgets.length === 0 && <p>No budgets set yet.</p>}
        </ul>
      </section>

      {/* -- The Modals -- */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Add Category">
        <AddCategoryModal onClose={() => setIsCategoryModalOpen(false)} />
      </Modal>

      <Modal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} title="Set Budget">
        <SetBudgetModal onClose={() => setIsBudgetModalOpen(false)} />
      </Modal>
    </div>
  );
};