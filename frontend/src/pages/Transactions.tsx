import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../store/store';
import { fetchTransactions, deleteTransaction, type Transaction } from '../store/slices/transactionSlice'; // Added Transaction type
import { fetchCategories } from '../store/slices/financeSlice';
import { Modal } from '../components/common/Modal';
import { AddTransactionModal } from '../components/finance/AddTransactionModal';
import { Plus, Filter, Trash2, ChevronLeft, ChevronRight, ReceiptText, ArrowUpRight, ArrowDownRight, PenLine } from 'lucide-react'; // Added PenLine

export const Transactions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, isLoading } = useSelector((state: RootState) => state.transaction);
  const { categories } = useSelector((state: RootState) => state.finance);

  const [page, setPage] = useState(1);
  const [limit] = useState(10); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 1. New State for Editing
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
     setPage(1); 
  }, [filterType, filterCategory]);

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
    <div className="space-y-6">
        
        {/* Page Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transaction History</h1>
                <p className="text-sm text-slate-500 mt-1">Review and manage your daily ledger.</p>
            </div>
            <div className="mt-4 sm:mt-0">
                {/* 2. Reset editing state when clicking "New Transaction" */}
                <button 
                    onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-brand-600 text-white rounded-lg shadow-sm font-semibold hover:bg-brand-700 focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all text-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Transaction
                </button>
            </div>
        </div>

        {/* Filter Bar (unchanged) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center sm:items-end">
            <div className="w-full sm:w-64">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter by Type</label>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                        onChange={(e) => setFilterType(e.target.value)} 
                        value={filterType}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none transition-all"
                    >
                        <option value="">All Transactions</option>
                        <option value="expense">Expense Only</option>
                        <option value="income">Income Only</option>
                    </select>
                </div>
            </div>

            <div className="w-full sm:w-64">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter by Category</label>
                <select 
                    onChange={(e) => setFilterCategory(e.target.value)} 
                    value={filterCategory}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                >
                    <option value="">All Categories</option>
                    {(categories ?? []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
            </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20 text-slate-400">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mr-3"></div>
                         Loading entries...
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/80 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th scope="col" className="px-6 py-4">Date</th>
                                <th scope="col" className="px-6 py-4">Category</th>
                                <th scope="col" className="px-6 py-4 hidden sm:table-cell">Description</th>
                                <th scope="col" className="px-6 py-4">Type</th>
                                <th scope="col" className="px-6 py-4 text-right">Amount</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <ReceiptText className="w-12 h-12 text-slate-300 mb-3" />
                                            <span className="font-medium text-slate-700 text-lg mb-1">No matching transactions</span>
                                            <p className="text-sm">Try adjusting your filters or creating a new record.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                            {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.category?.color || '#94a3b8' }} />
                                                <span className="text-slate-800">{t.category?.name || 'Unknown'}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-500 max-w-xs truncate">
                                            {t.description || '-'}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {t.type === 'income' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    <ArrowUpRight className="w-3 h-3 mr-1" /> Income
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                                                    <ArrowDownRight className="w-3 h-3 mr-1" /> Expense
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right">
                                            <span className={t.type === 'income' ? 'text-emerald-600' : 'text-slate-700'}>
                                                {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>

                                        {/* 3. Replaced Actions <td> with Edit and Delete buttons */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="inline-flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => { setEditingTransaction(t); setIsModalOpen(true); }}
                                                    className="text-slate-400 hover:text-brand-600 hover:bg-brand-50 p-1.5 rounded-lg outline-none transition-colors" 
                                                    title="Edit Transaction"
                                                >
                                                    <PenLine className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(t._id)}
                                                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg outline-none transition-colors" 
                                                    title="Delete Transaction"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            
            {/* Pagination*/}
            {!isLoading && transactions.length > 0 && (
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-sm text-slate-500 hidden sm:inline-block">Page {page}</span>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 1} 
                            onClick={() => setPage(p => p - 1)}
                            className="inline-flex items-center px-3 py-1.5 border border-slate-200 text-sm font-medium rounded text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Prev</span>
                        </button>
                        <button 
                            disabled={transactions.length < limit} 
                            onClick={() => setPage(p => p + 1)}
                            className="inline-flex items-center px-3 py-1.5 border border-slate-200 text-sm font-medium rounded text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="w-4 h-4 sm:ml-1" />
                        </button>
                    </div>
                </div>
            )}
        </div>

      {/* 4. Updated Modal Logic */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingTransaction ? "Edit Transaction" : "Add Transaction"}
      >
        <AddTransactionModal 
            onClose={() => setIsModalOpen(false)} 
            initialData={editingTransaction} 
        />
      </Modal>
    </div>
  );
};