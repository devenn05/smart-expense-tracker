import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom"
import { registerSchema, type RegisterForm } from "../utils/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "../services/authService";
import { setCredentials } from "../store/slices/authSlice";
import { User, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";

export const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { register, handleSubmit, formState: {errors, isSubmitting}, setError} = useForm<RegisterForm>({resolver: zodResolver(registerSchema)})

    const onSubmit = async(data: RegisterForm)=>{
        try{
            const response = await authService.register(data);
            dispatch(setCredentials(response.user))
            navigate('/dashboard')
        } catch(error: any){
            setError('root', {
                message: error.response?.data?.message || 'Registration failed',
            });
        }
    }
    
    return (
        <div>
            <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-slate-900">Create an Account</h3>
                <p className="text-sm text-slate-500 mt-1">Join to track your budget effortlessly.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errors.root && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                        <span className="font-semibold">{errors.root.message}</span>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                            type="text" 
                            {...register("name")}
                            placeholder="John Doe"
                            className={`block w-full pl-10 px-3 py-2.5 bg-slate-50 border ${errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-brand-500'} rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 transition-all`}
                        />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                            type="email" 
                            {...register("email")}
                            placeholder="you@example.com"
                            className={`block w-full pl-10 px-3 py-2.5 bg-slate-50 border ${errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-brand-500'} rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 transition-all`}
                        />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                            type="password" 
                            {...register("password")}
                            placeholder="••••••••"
                            className={`block w-full pl-10 px-3 py-2.5 bg-slate-50 border ${errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-brand-500'} rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 transition-all`}
                        />
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-rose-500 leading-snug">{errors.password.message}</p>}
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 transition-all"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating Account...
                        </>
                    ) : 'Register Account'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex justify-center items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Login
                </Link>
            </div>
        </div>
    )
}