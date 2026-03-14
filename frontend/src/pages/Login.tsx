import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux"
import { useNavigate, Link } from "react-router-dom";
import { loginSchema, type LoginForm } from "../utils/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "../services/authService";
import { setCredentials } from "../store/slices/authSlice";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {register, handleSubmit, formState:{errors, isSubmitting }, setError} = useForm<LoginForm>({resolver: zodResolver(loginSchema)})

    const onSubmit = async (data: LoginForm)=>{
        try {
            const response = await authService.login(data)
            dispatch(setCredentials(response.user))
            navigate('/dashboard')
        } catch (error: any) {
            setError('root', {
                message: error.response?.data?.message || 'Login failed',
            })
        }
    }
    
    return(
        <div>
            <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-slate-900">Welcome Back</h3>
                <p className="text-sm text-slate-500 mt-1">Sign in to manage your finances.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {errors.root && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                        <span className="font-semibold block sm:inline">{errors.root.message}</span>
                    </div>
                )}

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
                            className={`block w-full pl-10 px-3 py-2.5 bg-slate-50 border ${errors.email ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500'} rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:bg-white transition-all`}
                        />
                    </div>
                    {errors.email && <p className="mt-1.5 text-xs text-rose-500">{errors.email.message}</p>}
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
                            className={`block w-full pl-10 px-3 py-2.5 bg-slate-50 border ${errors.password ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500'} rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:bg-white transition-all`}
                        />
                    </div>
                    {errors.password && <p className="mt-1.5 text-xs text-rose-500">{errors.password.message}</p>}
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Signing in...
                        </>
                    ) : 'Sign In'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-slate-600 flex justify-center gap-1 items-center">
                    Don't have an account? 
                    <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500 flex items-center group transition-colors">
                        Create one <ArrowRight className="w-4 h-4 ml-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-1 transition-all" />
                    </Link>
                </p>
            </div>
        </div>
    )
}