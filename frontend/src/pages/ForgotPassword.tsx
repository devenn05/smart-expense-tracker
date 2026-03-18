import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, resetPasswordSchema, type ForgotPasswordForm, type ResetPasswordForm } from '../utils/validations';
import { authService } from '../services/authService';
import { Mail, KeyRound, Lock, Loader2, ArrowLeft } from 'lucide-react';

export const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1|2>(1);
    const [targetEmail, setTargetEmail] = useState('');

    const step1 = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema) });
    const step2 = useForm<ResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema) });

    const handleSendCode = async (data: ForgotPasswordForm) => {
        try {
            await authService.forgotPassword(data);
            setTargetEmail(data.email);
            setStep(2);
        } catch(error: any) { step1.setError('root', { message: error.response?.data?.message || 'Submission Failure' }); }
    };

    const handleResetAction = async (data: ResetPasswordForm) => {
        try {
            await authService.resetPassword({ email: targetEmail, otp: data.emailOtp, newPassword: data.newPassword });
            navigate('/login'); 
            // We force a standard login immediately confirming keys mapping actively
        } catch(error: any) { step2.setError('root', { message: error.response?.data?.message || 'Bad Sync Parameter Token.' }); }
    }

    if (step === 2) {
       return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
           <div className="mb-6 text-center">
             <h3 className="text-xl font-bold text-slate-900">Reset Password</h3>
             <p className="text-sm text-slate-500 mt-2">Security override pin texted to <strong>{targetEmail}</strong></p>
           </div>
           
           <form onSubmit={step2.handleSubmit(handleResetAction)} className="space-y-4">
             {step2.formState.errors.root && <div className="text-sm text-rose-600 font-bold bg-rose-50 p-2 text-center rounded">{step2.formState.errors.root.message}</div>}
             <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">6-Digit Pin Entry</label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input type="text" autoComplete="off" inputMode="numeric" maxLength={6} {...step2.register('emailOtp')} className="block w-full pl-10 pr-3 py-2.5 text-center font-bold tracking-[0.5em] text-lg bg-slate-50 border border-slate-200 outline-none rounded-lg focus:ring-1 focus:ring-brand-500" />
                </div>
                {step2.formState.errors.emailOtp && <p className="mt-1 text-xs text-rose-500 text-center">{step2.formState.errors.emailOtp.message}</p>}
             </div>
             <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1">Replacement Secret</label>
                 <div className="relative"><Lock className="absolute left-3 top-3 w-4 h-4 text-emerald-500" />
                 <input type="password" {...step2.register('newPassword')} className="block w-full pl-10 pr-3 py-2 bg-emerald-50/40 border border-emerald-100 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-medium" /></div>
                 {step2.formState.errors.newPassword && <p className="mt-1 text-xs text-rose-500">{step2.formState.errors.newPassword.message}</p>}
             </div>
             
             <button type="submit" disabled={step2.formState.isSubmitting} className="w-full flex justify-center mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm py-3 transition-colors">
                 {step2.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : "Reset Password."}
             </button>
           </form>
        </div>
       )
    }

    return (
       <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="mb-6 text-center"><h3 className="text-xl font-bold text-slate-900">Reset Password</h3><p className="text-sm text-slate-500 mt-2 leading-relaxed">Enter your registered email address to receive a verification OTP and reset your password.</p></div>

          <form onSubmit={step1.handleSubmit(handleSendCode)} className="space-y-4">
              {step1.formState.errors.root && <div className="text-sm text-rose-600 font-bold bg-rose-50 p-2 text-center rounded">{step1.formState.errors.root.message}</div>}
              <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Registered Email</label>
                  <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                      <input type="email" placeholder="identity@hub.link" {...step1.register('email')} className="w-full pl-10 pr-3 py-2 rounded-lg bg-slate-50 border outline-none text-sm border-slate-200 focus:border-brand-500" />
                  </div>
              </div>
              <button type="submit" disabled={step1.formState.isSubmitting} className="w-full bg-slate-900 text-white shadow font-semibold py-2.5 rounded-lg text-sm mt-2">{step1.formState.isSubmitting ? <Loader2 className="w-4 h-4 mx-auto animate-spin" /> : "Reset Password"}</button>
          </form>

          <Link to="/login" className="inline-flex mt-6 w-full items-center justify-center font-semibold text-xs text-slate-500 hover:text-slate-800 transition-colors"> <ArrowLeft className="w-3.5 h-3.5 mr-1"/> Login?  </Link>
       </div>
    );
}