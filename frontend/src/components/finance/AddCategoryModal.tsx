import { useForm } from "react-hook-form"
import { categorySchema, type CategoryForm } from "../../utils/validations"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "../../store/store"
import { addCategory, fetchCategories } from "../../store/slices/financeSlice"

export const AddCategoryModal = ({ onClose }: { onClose: () => void }) => {
    const dispatch = useDispatch<AppDispatch>()
    const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<CategoryForm>({resolver: zodResolver(categorySchema)})

    const onSubmit = async (data: CategoryForm) =>{
        try{
            await dispatch(addCategory({ ...data, color: data.color || '#3B82F6' })).unwrap();
            dispatch(fetchCategories());
            onClose();
        } catch (error) {
            alert(error);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label>Category Name: </label>
                <input type="text" {...register('name')} placeholder="e.g. Groceries" />
                {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
            </div>

            <div style={{ marginTop: '10px' }}>
                <label>Color Tag: </label>
                <input type="color" {...register('color')} />
            </div>
            <button type="submit" disabled={isSubmitting} style={{ marginTop: '15px' }}>
                {isSubmitting ? 'Saving...' : 'Create Category'}
            </button>
        </form>
    )
}