import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../store/store';
import { fetchTransactions, deleteTransaction, type Transaction } from '../store/slices/transactionSlice'; 
import { fetchCategories } from '../store/slices/financeSlice';
import { Modal } from '../components/common/Modal';
import { AddTransactionModal } from '../components/finance/AddTransactionModal';
import { Plus, Filter, Trash2, ChevronLeft, ChevronRight, ReceiptText, ArrowUpRight, ArrowDownRight, PenLine, Search, ChevronUp, ChevronDown } from 'lucide-react';

export const Transactions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, totalElements, totalPages, isLoading } = useSelector((state: RootState) => state.transaction);
  const { categories } = useSelector((state: RootState) => state.finance);

  // UI state for managing modal visibility and edit modes
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Pagination and view constraints
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); 

  // Filter state for server-side queries
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Sorting state (prefixing with '-' denotes descending order in backend)
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle search debouncing to reduce API overhead and reset page index
  useEffect(() => {
    const handler = setTimeout(() => { 
        setDebouncedSearch(searchQuery); 
        setPage(1); 
    }, 400); 
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync data whenever pagination, filters, or sorting parameters change
  useEffect(() => {
    const filters: any = { page, limit };
    
    if (filterType) filters.type = filterType;
    if (filterCategory) filters.category = filterCategory;
    if (debouncedSearch) filters.search = debouncedSearch;
    
    // Construct sort string for backend (e.g., "-date" for descending)
    if (sortField) filters.sort = sortOrder === 'asc' ? sortField : `-${sortField}`;

    dispatch(fetchTransactions(filters));
  }, [dispatch, filterType, filterCategory, page, limit, debouncedSearch, sortField, sortOrder]);

  // Manual confirmation flow for deletions using hot-toast
  const handleDelete = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Delete this transaction?</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              dispatch(deleteTransaction(id));
              toast.dismiss(t.id);
              toast.success("Transaction deleted");
            }}
            className="bg-green-600 text-white px-3 py-1 rounded-md text-xs font-semibold"
          >
            Confirm
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="bg-red-600 text-white px-3 py-1 rounded-md text-xs font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 4000 });
  };

  // Helper component for interactive table headers
  const SortableHeader = ({ label, field, className = "" }: { label: string, field: string, className?: string }) => {
    const isActive = sortField === field;
    return (
      <th 
        scope="col" 
        onClick={() => { 
          if (isActive) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          } else { 
            setSortField(field); 
            setSortOrder('desc'); 
          }
          setPage(1);
        }}
        className={`px-6 py-4 cursor-pointer select-none group hover:bg-slate-200 transition-colors ${className}`}
      >
        <div className="flex items-center gap-1.5">
          {label}
          <div className={`flex flex-col opacity-50 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 text-brand-600' : ''}`}>
             {isActive ? (
               sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
             ) : (
               <ChevronDown className="w-3.5 h-3.5" />
             )}
          </div>
        </div>
      </th>
    );
  };
  
  // Display calculations for "Showing X to Y" footer text
  const currentLow = totalElements === 0 ? 0 : ((page - 1) * limit) + 1;
  const currentHigh = Math.min(page * limit, totalElements);

  // Dynamic category filtering based on selected financial type (income/expense)
  const availableCategories = (categories ?? []).filter(c => 
      filterType ? c.type === filterType : true
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Page Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transaction History</h1>
                <p className="text-sm text-slate-500 mt-1">Review, track, and audit detailed line-items.</p>
            </div>
            <div className="mt-4 sm:mt-0">
                <button 
                    onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-brand-600 text-white rounded-lg shadow-sm font-semibold hover:bg-brand-700 transition-all text-sm"
                >
                    <Plus className="w-4 h-4 mr-2" /> New Transaction
                </button>
            </div>
        </div>

        {/* Global Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-auto flex-1 max-w-md">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Search Keywords</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g., Grocery, Rent..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all" 
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="w-full sm:w-48">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Transaction Type</label>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select 
                            value={filterType} 
                            onChange={(e) => { 
                                setFilterType(e.target.value); 
                                setFilterCategory('');
                                setPage(1);
                            }}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none transition-all"
                        >
                            <option value="">All Activity</option>
                            <option value="expense">Expenses Only</option>
                            <option value="income">Income Only</option>
                        </select>
                    </div>
                </div>

                <div className="w-full sm:w-48">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                    <select 
                        value={filterCategory}
                        onChange={(e) => {
                            setFilterCategory(e.target.value);
                            setPage(1);
                        }} 
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    >
                        <option value="">All Categories</option>
                        {availableCategories.map((c) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        {/* Transactions Data Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto min-h-[400px]">
                {isLoading ? (
                    <div className="flex justify-center items-center py-32 text-slate-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mr-3"></div>
                        Fetching records...
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/80 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <SortableHeader label="Date" field="date" />
                                <th scope="col" className="px-6 py-4">Category</th>
                                <SortableHeader label="Description" field="description" className="hidden sm:table-cell" />
                                <SortableHeader label="Type" field="type" />
                                <SortableHeader label="Amount" field="amount" className="text-right" />
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <ReceiptText className="w-12 h-12 text-slate-300 mb-3" />
                                            <span className="font-semibold text-slate-700 text-lg mb-1">No data available</span>
                                            <p className="text-sm">We couldn't find any records matching your filters.</p>
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
                                                <span className="text-slate-800">{t.category?.name || 'Uncategorized'}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-500 max-w-[200px] truncate" title={t.description}>
                                            {t.description || '-'}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {t.type === 'income' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    <ArrowUpRight className="w-3 h-3 mr-1" /> Credited
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                                                    <ArrowDownRight className="w-3 h-3 mr-1" /> Expensed
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                                            <span className={t.type === 'income' ? 'text-emerald-600' : 'text-slate-700'}>
                                                {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="inline-flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingTransaction(t); setIsModalOpen(true); }} className="text-slate-400 hover:text-brand-600 hover:bg-brand-50 p-1.5 rounded-lg transition-colors" title="Edit">
                                                    <PenLine className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(t._id)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors" title="Delete">
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
            
            {/* Pagination Controls */}
            {!isLoading && (
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-500 text-center md:text-left">
                        Showing <span className="font-semibold text-slate-700">{currentLow}</span> to <span className="font-semibold text-slate-700">{currentHigh}</span> of <span className="font-semibold text-slate-900">{totalElements}</span> entries
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Per Page</label>
                            <select 
                                value={limit} 
                                onChange={(e) => {
                                  setLimit(Number(e.target.value));
                                  setPage(1);
                                }}
                                className="py-1 px-2 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer" 
                            >
                                {[5, 10, 20, 50].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button 
                                disabled={page <= 1} 
                                onClick={() => setPage(p => p - 1)} 
                                className="inline-flex items-center px-2 py-1.5 border border-slate-200 text-sm font-medium rounded text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">Previous</span>
                            </button>
                            
                            <span className="px-3 text-sm text-slate-600 font-semibold bg-white py-1.5 rounded-md border border-slate-200 shadow-sm">
                                {page} / {totalPages || 1}
                            </span>

                            <button 
                                disabled={page >= totalPages || totalPages === 0} 
                                onClick={() => setPage(p => p + 1)} 
                                className="inline-flex items-center px-2 py-1.5 border border-slate-200 text-sm font-medium rounded text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="w-4 h-4 sm:ml-1" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

      {/* Transaction Entry/Edit Portal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingTransaction ? "Modify Transaction" : "Add Transaction"}
      >
        <AddTransactionModal 
          onClose={() => setIsModalOpen(false)} 
          initialData={editingTransaction} 
        />
      </Modal>

    </div>
  );
};