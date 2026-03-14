import { useForm } from "react-hook-form"
import { categorySchema, type CategoryForm } from "../../utils/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../../store/store"
import { addCategory, fetchCategories } from "../../store/slices/financeSlice"
import { Loader2 } from "lucide-react"

export const AddCategoryModal = ({ onClose }: { onClose: () => void }) => {
    const dispatch = useDispatch<AppDispatch>()
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CategoryForm>({
        resolver: zodResolver(categorySchema),
        defaultValues: { color: '#0ea5e9' } // Default to brand blue
    })

    const onSubmit = async (data: CategoryForm) => {
        try {
            await dispatch(addCategory({ ...data, color: data.color || '#0ea5e9' })).unwrap();
            dispatch(fetchCategories());
            onClose();
        } catch (error) {
            alert(error);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                <input 
                    type="text" 
                    {...register('name')} 
                    placeholder="e.g. Groceries, Entertainment" 
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400"
                />
                {errors.name && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.name.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Color Identifier</label>
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm focus-within:border-brand-500 transition-all shrink-0">
                        <input 
                            type="color" 
                            {...register('color')} 
                            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer bg-transparent border-0 p-0"
                        />
                    </div>
                    <span className="text-sm text-slate-500">Pick a color to quickly identify this category in charts and lists.</span>
                </div>
            </div>

            <div className="pt-2">
                <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                    {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : 'Create Category'}
                </button>
            </div>
        </form>
    )
}