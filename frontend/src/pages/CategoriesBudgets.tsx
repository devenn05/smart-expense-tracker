import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../store/store';
import { 
  fetchCategories, 
  fetchBudget, 
  deleteCategory, 
  deleteBudget,  
  type Category, 
  type Budget 
} from '../store/slices/financeSlice';
import { fetchAnalytics } from '../store/slices/analyticsSlice';
import { Modal } from '../components/common/Modal';
import { AddCategoryModal } from '../components/finance/AddCategoryModal';
import { SetBudgetModal } from '../components/finance/SetBudgetModal';
import toast from 'react-hot-toast'; 
import { Plus, Tags, Target, Lock, LayoutGrid, Pen, Trash2 } from 'lucide-react';

export const CategoriesBudgets = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Finance + analytics state
  const { categories, budgets } = useSelector((state: RootState) => state.finance);
  const { data: analyticsData } = useSelector((state: RootState) => state.analytics);

  // Currently selected items (used for edit flows)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  // Modal visibility state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Initial data load
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBudget());
    dispatch(fetchAnalytics());
  }, [dispatch]);

  // Handles category deletion with confirmation toast
  const handleDeleteCategory = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm text-slate-900">
          Delete this category?
        </p>
        <p className="text-xs text-slate-500 pb-2">
          All transactions mapped MUST be reassigned.
        </p>

        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await dispatch(deleteCategory(id)).unwrap();
                toast.success("Category deleted safely!");
              } catch (err: any) {
                toast.error(err, { duration: 6000 });
              }
            }}
            className="bg-brand-600 text-white font-semibold hover:bg-brand-700 px-3 py-1.5 rounded text-xs transition-colors shadow-sm"
          >
            Confirm Action
          </button>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-slate-200 text-slate-800 font-medium hover:bg-slate-300 px-3 py-1.5 rounded text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  // Handles budget deletion with confirmation toast
  const handleDeleteBudget = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-sm text-rose-800">
          Stop tracking this limit?
        </p>

        <div className="flex gap-2 pt-1">
          <button
            onClick={async () => { 
              toast.dismiss(t.id); 
              try { 
                await dispatch(deleteBudget(id)).unwrap(); 
                toast.success('Tracking parameter wiped successfully.'); 
              } catch (e: any) { 
                toast.error(e); 
              } 
            }}
            className="bg-rose-500 hover:bg-rose-600 text-white shadow-sm font-semibold px-3 py-1 rounded text-xs"
          >
            Remove Tracker
          </button>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-slate-200 text-slate-800 font-semibold px-3 py-1 rounded text-xs hover:bg-slate-300"
          >
            Keep Limit
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  // Split categories by type for grouped rendering
  const incomeCats = (categories || []).filter((c) => c.type === 'income');
  const expenseCats = (categories || []).filter((c) => c.type === 'expense');

  // Renders a grouped category list (income / expense)
  const RenderCategoryGroup = ({ title, items }: { title: string; items: Category[] }) => (
    <div className="mb-6 last:mb-0">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">
        {title}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((c) => (
          <div
            key={c._id}
            className="group flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-brand-200 transition-colors"
          >
            {/* Category info */}
            <div className="flex items-center gap-3 truncate">
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: c.color }}
              />
              <span className="text-sm font-medium text-slate-700 truncate">
                {c.name}
              </span>
            </div>

            {/* Actions (hidden for predefined categories) */}
            {c.isPredefined ? (
              <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0 ml-2" />
            ) : (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button
                  onClick={() => {
                    setSelectedCategory(c);
                    setIsCategoryModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded transition-colors"
                >
                  <Pen className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDeleteCategory(c._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Finance Setup
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure your categories and set maximum spending boundaries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories section */}
        <section className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-5 border-b bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Tags className="w-5 h-5 text-brand-500" />
              <h3 className="font-semibold text-slate-800">Categories</h3>
            </div>

            <button
              onClick={() => {
                setSelectedCategory(null);
                setIsCategoryModalOpen(true);
              }}
              className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm transition-all text-slate-700"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1 bg-slate-50/20">
            <RenderCategoryGroup title="Expense Categories" items={expenseCats} />
            <RenderCategoryGroup title="Income Categories" items={incomeCats} />
          </div>
        </section>

        {/* Budgets section */}
        <section className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-5 border-b bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-slate-800">
                Budgets (Expenses)
              </h3>
            </div>

            <button
              onClick={() => {
                setSelectedBudget(null);
                setIsBudgetModalOpen(true);
              }}
              className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-slate-50 transition-all text-slate-700"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Set Limit
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1">
            {/* Empty state */}
            {budgets.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-slate-400">
                <LayoutGrid className="w-12 h-12 stroke-1 mb-2 text-slate-300" />
                <p className="text-sm">No monthly budgets set yet.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {budgets.map((b) => {
                  // Find total spent for this category from analytics
                  const spentObj = analyticsData?.categoryBreakdown?.find(
                    c => c.categoryId === b.category?._id
                  );

                  const spentAmount = spentObj ? spentObj.totalSpent : 0;
                  const remaining = b.amount - spentAmount;

                  // Clamp progress at 100%
                  const percent = Math.min((spentAmount / b.amount) * 100, 100);

                  // Dynamic progress bar color based on usage
                  let barColor = 'bg-emerald-500';
                  if (percent >= 90) barColor = 'bg-rose-500';
                  else if (percent >= 70) barColor = 'bg-amber-400';

                  return (
                    <li
                      key={b._id}
                      className="group p-4 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all flex flex-col gap-3"
                    >
                      {/* Header row */}
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-800 text-sm">
                          {b.category?.name || 'Unknown Category'}
                        </span>

                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-sm font-bold text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded border border-slate-200">
                            Limit: ₹{b.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>

                          {/* Edit/Delete actions */}
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
                            <button
                              onClick={() => {
                                setSelectedBudget(b);
                                setIsBudgetModalOpen(true);
                              }}
                              className="text-slate-400 hover:bg-brand-50 hover:text-brand-600 p-1.5 transition-colors outline-none border-r border-slate-100"
                              title="Edit Limit"
                            >
                              <Pen className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteBudget(b._id)}
                              className="text-slate-400 hover:bg-rose-50 hover:text-rose-600 p-1.5 transition-colors outline-none"
                              title="Erase Limit Guard"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-200/60 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-700 ${barColor}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {/* Spend summary */}
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">
                          Spent: <span className="text-slate-700">
                            ₹{spentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </span>

                        {remaining < 0 ? (
                          <span className="text-rose-600 font-bold animate-pulse flex items-center gap-1">
                            Overspent by ₹{Math.abs(remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className={`${percent >= 90 ? 'text-rose-500' : 'text-slate-500'}`}>
                            Left:{' '}
                            <span className={`${percent >= 90 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                              ₹{remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Category modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={selectedCategory ? 'Modify Existing Category' : 'Add Custom Category'}
      >
        <AddCategoryModal
          onClose={() => setIsCategoryModalOpen(false)}
          initialData={selectedCategory}
        />
      </Modal>

      {/* Budget modal */}
      <Modal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        title={selectedBudget ? 'Edit Budget' : 'Add Budget'}
      >
        <SetBudgetModal
          onClose={() => setIsBudgetModalOpen(false)}
          initialData={selectedBudget}
        />
      </Modal>
    </div>
  );
};