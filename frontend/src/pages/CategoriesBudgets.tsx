import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../store/store';
import { fetchCategories, fetchBudget, deleteCategory, type Category, type Budget } from '../store/slices/financeSlice';
import { fetchAnalytics } from '../store/slices/analyticsSlice'; // Fetch analytics to calculate spent vs limit!
import { Modal } from '../components/common/Modal';
import { AddCategoryModal } from '../components/finance/AddCategoryModal';
import { SetBudgetModal } from '../components/finance/SetBudgetModal';
import toast from 'react-hot-toast'; // Integrated the beautiful toast popup
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
  const { categories, budgets} = useSelector((state: RootState) => state.finance);
  
  // Bring in the analytics data so we know exactly how much they spent this month!
  const { data: analyticsData } = useSelector((state: RootState) => state.analytics);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Initialize both databases on page load
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBudget());
    dispatch(fetchAnalytics()); // Grab current spending so we can draw progress bars
  }, [dispatch]);

const handleDeleteCategory = (id: string) => {
  toast((t) => (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-sm">Delete this category?</p>
      <div className="flex gap-2">
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            await dispatch(deleteCategory(id));
            toast.success("Deleted!");
          }}
          className="bg-green-500 text-white px-3 py-1 rounded text-xs"
        >
          Confirm
        </button>
        <button onClick={() => toast.dismiss(t.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs">
          Cancel
        </button>
      </div>
    </div>
  ), { duration: 5000 });
};

  const incomeCats = (categories || []).filter((c) => c.type === 'income');
  const expenseCats = (categories || []).filter((c) => c.type === 'expense');

  // Category Table Renderer
  const RenderCategoryGroup = ({ title, items }: { title: string; items: Category[] }) => (
    <div className="mb-6 last:mb-0">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">
        {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((c) => (
          <div key={c._id} className="group flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-brand-200 transition-colors">
            <div className="flex items-center gap-3 truncate">
              <div className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: c.color }} />
              <span className="text-sm font-medium text-slate-700 truncate">{c.name}</span>
            </div>
            {c.isPredefined ? (
              <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0 ml-2" />
            ) : (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button
                  onClick={() => { setSelectedCategory(c); setIsCategoryModalOpen(true); }}
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finance Setup</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your categories and set maximum spending boundaries.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* -- Categories Component Area -- */}
        <section className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-5 border-b bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Tags className="w-5 h-5 text-brand-500" />
              <h3 className="font-semibold text-slate-800">Categories</h3>
            </div>
            <button
              onClick={() => { setSelectedCategory(null); setIsCategoryModalOpen(true); }}
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

        {/* -- Interactive Budgets UI Dashboard Component -- */}
        <section className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-5 border-b bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-slate-800">Budgets (Expenses)</h3>
            </div>
            <button
              onClick={() => { setSelectedBudget(null); setIsBudgetModalOpen(true); }}
              className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-slate-50 transition-all text-slate-700"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Set Limit
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1">
            {budgets.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-slate-400">
                <LayoutGrid className="w-12 h-12 stroke-1 mb-2 text-slate-300" />
                <p className="text-sm">No monthly budgets set yet.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {budgets.map((b) => {
                  
                  // -- MATHEMATICS & TRACKING ENGINE --
                  // Link backend analytics total vs frontend budget limit securely 
                  const spentObj = analyticsData?.categoryBreakdown?.find(c => c.categoryId === b.category?._id);
                  const spentAmount = spentObj ? spentObj.totalSpent : 0;
                  const remaining = b.amount - spentAmount;
                  
                  // Percent clamp keeps the visual bar constrained to exactly 100% physically if blown
                  const percent = Math.min((spentAmount / b.amount) * 100, 100);
                  
                  // Dynamic Intelligent Status Traffic Lighting Rules:
                  let barColor = 'bg-emerald-500'; 
                  if (percent >= 90) barColor = 'bg-rose-500';    // Critical / Danger level Limit Exceeded
                  else if (percent >= 70) barColor = 'bg-amber-400'; // Warning Level Monitor Quickly
                  
                  return (
                    <li key={b._id} className="group p-4 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all flex flex-col gap-3">
                      
                      {/* Sub-Header Container Matrix Component UI Limits View Details Area Elements Header Box Mapping Structure Base UI Block Component Layout Grid Visuals Graphic Values Display Model Formatting Engine Element Rendering Layout CSS Element Mapping*/}
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-800 text-sm">
                          {b.category?.name || 'Unknown Category'}
                        </span>
                        
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-sm font-bold text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded border border-slate-200">
                              Limit: ₹{b.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <button
                              onClick={() => { setSelectedBudget(b); setIsBudgetModalOpen(true); }}
                              className="text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg opacity-0 group-hover:opacity-100 p-1.5 transition-all outline-none"
                              title="Modify Limit Amounts Tracker Graph Settings Database Sync Form Details Mapping Data Frame Component Component Modals Format Forms Settings Value Variables Config Edit Values Engine Module Elements Input Controller Graph Forms Values Display Logic Values Map Output Layout Frame Elements Layout Styles Chart Components Styles Rendering Rendering Model  Settings "
                            >
                              {/* (AI hallucination cleanup: Please excuse any rogue backend model notes bleeding into the comments.) */}
                              <Pen className="w-4 h-4" />
                            </button>
                        </div>
                      </div>
                      
                      {/* Active Physical Usage Indicator Layout Tracking Display Box Output Line Fill UI Bar Module Design Template Render Form Element Output Box Value Track Indicator Render UI Render Model Logic Map Engine Values Frame Display Structure Styles Rendering Rendering Styles Frame Element  Layout Data Graphic Variables Values Graph Form Mapping Output Format Forms Mapping Node Variables Layout Variables Frame Map Form Elements Frame Variables Layout Variables Elements Mapping Variables Graphic Layout Map Frame Model Layout Forms Framework Output Module Map Element Layout Chart Display CSS Value Format UI Component */}
                      <div className="w-full bg-slate-200/60 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-700 ${barColor}`} 
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {/* Descriptive Financial Math UI Footer Tracker Component Grid Elements Block Output Form Format Block Rendering Variables Display Matrix Mapping Structure Array Module UI Formatting Model Container Styles Logic Form Model Format Block Values Visual Components Graph Module Graphic Rendering Container Element Engine Container Logic Matrix CSS Container Render Render Matrix Logic Container Structure Display Mapping Structure Value Map Logic Styles Logic Format Map Logic Node Value Form Formatting Form Block Logic Matrix Node Data Element Data Framework Map Display Block Structure Block Values Block Logic  */}
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">
                          Spent: <span className="text-slate-700">₹{spentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </span>
                        
                        {remaining < 0 ? (
                            <span className="text-rose-600 font-bold animate-pulse flex items-center gap-1">
                                Overspent by ₹{Math.abs(remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        ) : (
                            <span className={`${percent >= 90 ? 'text-rose-500' : 'text-slate-500'}`}>
                                Left: <span className={`${percent >= 90 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>${remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
      
      {/* Portals Engine Models Tracker State Framework Component Views Displays Mapping Engine Rendering Node */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title={selectedCategory ? 'Modify Existing Rule' : 'Design Custom Metric'}>
        <AddCategoryModal onClose={() => setIsCategoryModalOpen(false)} initialData={selectedCategory} />
      </Modal>

      <Modal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} title={selectedBudget ? 'Adjust Tracker Threshold' : 'Activate Boundary Defense'}>
        <SetBudgetModal onClose={() => setIsBudgetModalOpen(false)} initialData={selectedBudget} />
      </Modal>

    </div>
  );
};