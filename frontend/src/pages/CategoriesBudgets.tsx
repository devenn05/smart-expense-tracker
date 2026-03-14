import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../store/store';
import { fetchCategories, fetchBudget } from '../store/slices/financeSlice';
import { Modal } from '../components/common/Modal';
import { AddCategoryModal } from '../components/finance/AddCategoryModal';
import { SetBudgetModal } from '../components/finance/SetBudgetModal';
import { Plus, Tags, Target, Lock, LayoutGrid } from 'lucide-react';

export const CategoriesBudgets = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, budgets, isLoading } = useSelector((state: RootState) => state.finance);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBudget());
  }, [dispatch]);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finance Management</h1>
            <p className="text-sm text-slate-500 mt-1">Configure your transaction categories and monthly spending limits.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* -- Categories Card -- */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2 text-slate-800">
                        <Tags className="w-5 h-5 text-brand-500" />
                        <h3 className="font-semibold">Categories</h3>
                    </div>
                    <button 
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 hover:border-brand-300 transition-colors shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1 text-brand-500" /> Add Custom
                    </button>
                </div>
                <div className="p-5 overflow-y-auto flex-1 bg-slate-50/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(categories ?? []).map((c) => (
                            <div key={c._id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors">
                                <div className="flex items-center gap-3 truncate">
                                    <div 
                                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" 
                                        style={{ backgroundColor: c.color }} 
                                    />
                                    <span className="text-sm font-medium text-slate-700 truncate">{c.name}</span>
                                </div>
                                {c.isPredefined ? (
                                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2"/>
                                ) : (
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0 ml-2">Custom</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* -- Budgets Card -- */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2 text-slate-800">
                        <Target className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-semibold">Monthly Budgets</h3>
                    </div>
                    <button 
                        onClick={() => setIsBudgetModalOpen(true)}
                        className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 hover:border-emerald-300 transition-colors shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Set Limit
                    </button>
                </div>
                
                <div className="p-5 overflow-y-auto flex-1">
                    {budgets.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                            <LayoutGrid className="w-12 h-12 stroke-1" />
                            <p className="text-sm">No monthly budgets set yet.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {(budgets ?? []).map((b) => (
                                <li key={b._id} className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                            <Target className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-800">
                                                {b.category?.name || 'Loading...'}
                                            </span>
                                            <span className="text-xs font-medium text-slate-500">Monthly Target</span>
                                        </div>
                                    </div>
                                    <div className="text-lg font-bold text-slate-700 tracking-tight">
                                        ${b.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </div>
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Add Category">
        <AddCategoryModal onClose={() => setIsCategoryModalOpen(false)} />
      </Modal>

      <Modal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} title="Set Monthly Budget">
        <SetBudgetModal onClose={() => setIsBudgetModalOpen(false)} />
      </Modal>
    </div>
  );
};