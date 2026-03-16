import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { categorySchema, updateCategorySchema } from "../../utils/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import { addCategory, updateCategory, fetchCategories, type Category } from "../../store/slices/financeSlice";
import { Loader2 } from "lucide-react";

interface ModalProps {
    onClose: () => void;
    initialData?: Category | null;
}

export const AddCategoryModal = ({ onClose, initialData }: ModalProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const isEditMode = !!initialData;

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<any>({
        // Smartly swap the validation schema based on edit vs create
        resolver: zodResolver(isEditMode ? updateCategorySchema : categorySchema),
        defaultValues: isEditMode ? {
            name: initialData.name,
            color: initialData.color
        } : { 
            color: '#0ea5e9',
            type: 'expense' // default to expense
        } 
    });

    const onSubmit = async (data: any) => {
        try {
            if (isEditMode) {
                await dispatch(updateCategory({ id: initialData._id, data: { name: data.name, color: data.color } })).unwrap();
                 toast.success("Category updated successfully!"); 
            } else {
                await dispatch(addCategory({ ...data, color: data.color || '#0ea5e9' })).unwrap();
                toast.success("Category added successfully!"); 
            }
            dispatch(fetchCategories()); // Refresh the visual list
            onClose();
        } catch (error: any) { toast.error(error.message || error);  }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                <input 
                    type="text" {...register('name')} placeholder="e.g. Groceries" 
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                />
                {errors.name && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name.message as string}</p>}
            </div>

            {/* ONLY show the Type dropdown if we are CREATING. We don't allow changing type after creation. */}
            {!isEditMode && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
                    <select {...register('type')} className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-brand-500 outline-none">
                        <option value="expense">Expense (Money going out)</option>
                        <option value="income">Income (Money coming in)</option>
                    </select>
                    {errors.type && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.type.message as string}</p>}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Color Identifier</label>
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-slate-200 shrink-0">
                        <input type="color" {...register('color')} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer bg-transparent border-0 p-0" />
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:ring-brand-500 disabled:opacity-70 transition-all">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditMode ? 'Update Category' : 'Create Category'}
                </button>
            </div>
        </form>
    );
}