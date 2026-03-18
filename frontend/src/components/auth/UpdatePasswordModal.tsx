import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../services/authService';
import { updatePasswordSchema, type UpdatePasswordForm } from '../../utils/validations';
import { KeyRound, Lock, Loader2 } from 'lucide-react';

export const UpdatePasswordModal = ({ onClose }: { onClose: () => void }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UpdatePasswordForm>({
        resolver: zodResolver(updatePasswordSchema)
    });

    const onSubmit = async (data: UpdatePasswordForm) => {
        try {
            await authService.updatePassword(data);
            toast.success("Password Updated Securely!");
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Current Secret</label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input type="password" {...register('currentPassword')} className="w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
                {errors.currentPassword && <p className="mt-1 text-xs text-rose-500">{errors.currentPassword.message}</p>}
            </div>

            <div className="pt-2 border-t border-slate-100">
                <label className="block text-sm font-semibold text-slate-700 mb-1">New Lock Signature</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-brand-500" />
                    <input type="password" {...register('newPassword')} className="w-full pl-9 pr-3 py-2 bg-brand-50/50 border border-brand-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
                <p className="text-xs text-slate-400 mt-1">Require 1 uppercase, 1 lowercase, 1 number, 8 chars.</p>
                {errors.newPassword && <p className="mt-1 text-xs text-rose-500">{errors.newPassword.message}</p>}
            </div>

            <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-slate-900 text-white hover:bg-black font-semibold rounded-lg text-sm">
                   {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Confirm Modification'}
                </button>
            </div>
        </form>
    )
}