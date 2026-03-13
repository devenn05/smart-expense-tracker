import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../store/store';
import { fetchTransactions, deleteTransaction } from '../store/slices/transactionSlice';
import { fetchCategories } from '../store/slices/financeSlice';
import { Modal } from '../components/common/Modal';
import { AddTransactionModal } from '../components/finance/AddTransactionModal';

export const Transactions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, isLoading } = useSelector((state: RootState) => state.transaction);
  const { categories } = useSelector((state: RootState) => state.finance);

  const [page, setPage] = useState(1);
  const [limit] = useState(10); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Local state to track active filters
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    // Make sure we have categories for the Add Modal to use
    dispatch(fetchCategories());
  }, [dispatch]);

   // Resetting page natively anytime our user swap target filters properly
  useEffect(() => {
     setPage(1); 
  }, [filterType, filterCategory]);

  // Notice how changing a dropdown immediately triggers a brand new backend fetch using APIFeatures!
  useEffect(() => {
    const filters: any = { page, limit };
    if (filterType) filters.type = filterType;
    if (filterCategory) filters.category = filterCategory;
    
    dispatch(fetchTransactions(filters));
  }, [dispatch, filterType, filterCategory, page, limit]);

  const handleDelete = (id: string) => {
    if(window.confirm('Are you sure you want to delete this transaction?')) {
      dispatch(deleteTransaction(id));
    }
  };

  return (
    <div>
      <h2>Transaction History</h2>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <button onClick={() => setIsModalOpen(true)}>+ Add Transaction</button>
        
        {/* API Filter Controls */}
        <select onChange={(e) => setFilterType(e.target.value)} value={filterType}>
          <option value="">All Transactions</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <select onChange={(e) => setFilterCategory(e.target.value)} value={filterCategory}>
          <option value="">All Categories</option>
          {(categories ?? []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {isLoading ? <p>Loading data...</p> : (
        <>
          <table border={1} cellPadding={10} style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#eee' }}>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.description || '-'}</td>
                  <td style={{ color: t.category?.color || 'black' }}>
                    {t.category?.name || 'Unknown'}
                  </td>
                  <td style={{ color: t.type === 'income' ? 'green' : 'red' }}>
                    {t.type.toUpperCase()}
                  </td>
                  <td>${t.amount.toFixed(2)}</td>
                  <td>
                    <button onClick={() => handleDelete(t._id)} style={{ color: 'red' }}>Delete</button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center' }}>No transactions found.</td></tr>
              )}
            </tbody>
          </table>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
             <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                Previous
             </button>
             <span>Page {page}</span>
             <button disabled={transactions.length < limit} onClick={() => setPage(p => p + 1)}>
                Next
             </button>
          </div>
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Transaction">
        <AddTransactionModal onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};