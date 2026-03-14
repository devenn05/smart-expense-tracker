import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../store/store';
import {
  fetchCategories,
  fetchBudget,
  deleteCategory,
  type Category,
  type Budget,
} from '../store/slices/financeSlice';
import { Modal } from '../components/common/Modal';
import { AddCategoryModal } from '../components/finance/AddCategoryModal';
import { SetBudgetModal } from '../components/finance/SetBudgetModal';
import {
  Plus,
  Tags,
  Target,
  Lock,
  LayoutGrid,
  Pen,
  Trash2,
} from 'lucide-react';

export const CategoriesBudgets = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, budgets, isLoading } = useSelector(
    (state: RootState) => state.finance
  );

  // States to hold the items being edited so the modal can pre-fill
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBudget());
  }, [dispatch]);

  const handleDeleteCategory = async (id: string) => {
    if (
      window.confirm(
        'Delete this custom category? Linked transactions may be affected.'
      )
    ) {
      dispatch(deleteCategory(id));
    }
  };

  // Pre-split for clean UI display
  const incomeCats = (categories || []).filter((c) => c.type === 'income');
  const expenseCats = (categories || []).filter((c) => c.type === 'expense');

  // Sub-component to render lists identically
  const RenderCategoryGroup = ({
    title,
    items,
  }: {
    title: string;
    items: Category[];
  }) => (
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
            <div className="flex items-center gap-3 truncate">
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: c.color }}
              />
              <span className="text-sm font-medium text-slate-700 truncate">
                {c.name}
              </span>
            </div>
            {c.isPredefined ? (
              <Lock
                className="w-3.5 h-3.5 text-slate-300 shrink-0 ml-2"
              />
            ) : (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button
                  onClick={() => {
                    setSelectedCategory(c);
                    setIsCategoryModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded"
                >
                  <Pen className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(c._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded"
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Finance Setup
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* -- Categories Card -- */}
        <section className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-5 border-b bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Tags className="w-5 h-5 text-brand-500" />
              <h3 className="font-semibold">Categories</h3>
            </div>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setIsCategoryModalOpen(true);
              }}
              className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 bg-white border rounded-md hover:bg-slate-50 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom
            </button>
          </div>
          <div className="p-5 overflow-y-auto flex-1 bg-slate-50/20">
            <RenderCategoryGroup
              title="Expense Categories"
              items={expenseCats}
            />
            <RenderCategoryGroup title="Income Categories" items={incomeCats} />
          </div>
        </section>

        {/* -- Budgets Card -- */}
        <section className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-5 border-b bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold">Budgets (Expenses)</h3>
            </div>
            <button
              onClick={() => {
                setSelectedBudget(null);
                setIsBudgetModalOpen(true);
              }}
              className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 bg-white border rounded-md shadow-sm hover:bg-slate-50"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Set Limit
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1">
            {budgets.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-slate-400">
                <LayoutGrid className="w-12 h-12 stroke-1 mb-2" />
                <p className="text-sm">No monthly budgets set yet.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {budgets.map((b) => (
                  <li
                    key={b._id}
                    className="group flex justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800">
                          {b.category?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-slate-700">
                        ${b.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedBudget(b);
                          setIsBudgetModalOpen(true);
                        }}
                        className="text-slate-400 hover:text-brand-500 opacity-0 group-hover:opacity-100 p-1"
                      >
                        <Pen className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={selectedCategory ? 'Edit Category' : 'Add Category'}
      >
        <AddCategoryModal
          onClose={() => setIsCategoryModalOpen(false)}
          initialData={selectedCategory}
        />
      </Modal>

      <Modal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        title={selectedBudget ? 'Edit Budget Limit' : 'Set New Budget'}
      >
        <SetBudgetModal
          onClose={() => setIsBudgetModalOpen(false)}
          initialData={selectedBudget}
        />
      </Modal>
    </div>
  );
};
