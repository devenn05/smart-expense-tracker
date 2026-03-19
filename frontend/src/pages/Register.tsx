import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerSchema, verifyOtpSchema, type RegisterForm, type VerifyOtpForm } from '../utils/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../services/authService';
import { setCredentials } from '../store/slices/authSlice';
import { User, Mail, Lock, Phone, Loader2, ArrowLeft, KeyRound, MessageSquare } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Workflow state: Step 1 = Details, Step 2 = OTP Verification
  const [step, setStep] = useState<1 | 2>(1);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [requiresWhatsapp, setRequiresWhatsapp] = useState(false);

  // Form instance for primary user details
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  // Form instance for the 2FA/OTP layer
  const otpForm = useForm<VerifyOtpForm>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {      
      emailOtp: '',
      whatsappOtp: '',
    },
  });

  // Post user details and trigger OTP dispatch via backend
  const onRegisterSubmit = async (data: RegisterForm) => {
    try {
      // Clean up optional phone field to prevent sending empty strings to API
      if (!data.phoneNumber) delete data.phoneNumber;

      const response = await authService.register(data);

      setRegisteredEmail(data.email);
      setRequiresWhatsapp(response.requiresWhatsAppOtp || false);
      
      // Clear previous attempts before moving to verification screen
      otpForm.reset({ emailOtp: '', whatsappOtp: '' }); 
      
      setStep(2);
    } catch (error: any) {
      registerForm.setError('root', {
        message: error.response?.data?.message || 'Registration failed',
      });
    }
  };

  // Verify dual-channel OTPs and establish user session
  const onOtpSubmit = async (data: VerifyOtpForm) => {
    try {
      const payload = {
        email: registeredEmail,
        emailOtp: data.emailOtp,
        whatsappOtp: data.whatsappOtp || undefined,
      };

      const response = await authService.verifyOtp(payload);

      dispatch(setCredentials(response.user));
      navigate('/dashboard');
    } catch (error: any) {
      otpForm.setError('root', {
        message: error.response?.data?.message || 'Invalid or expired OTP',
      });
    }
  };

  // View: Verification Step (Email + Optional WhatsApp)
  if (step === 2) {
    return (
      <div className="animate-in fade-in slide-in-from-right-8 duration-300">
        <div className="mb-6 text-center">
          <h3 className="text-xl font-bold text-slate-900">
            Verify Your Identity
          </h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            We sent a 6-digit code to <br />
            <span className="font-semibold text-slate-700">
              {registeredEmail}
            </span>
          </p>
        </div>

        <form
          onSubmit={otpForm.handleSubmit(onOtpSubmit)}
          className="space-y-4"
        >
          {otpForm.formState.errors.root && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-lg font-semibold">
              {otpForm.formState.errors.root.message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Verification Code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                autoComplete="off"
                inputMode="numeric"
                pattern="[0-9]*"
                {...otpForm.register('emailOtp')}
                className="block w-full pl-10 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-lg tracking-widest text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-center font-bold"
              />
            </div>
            {otpForm.formState.errors.emailOtp && (
              <p className="mt-1 text-xs text-rose-500 text-center">
                {otpForm.formState.errors.emailOtp.message}
              </p>
            )}
          </div>

          {/* Conditional field if user opted for WhatsApp alerts */}
          {requiresWhatsapp && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                WhatsApp Verification Code
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-emerald-500" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  autoComplete="off"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  {...otpForm.register('whatsappOtp')}
                  className="block w-full pl-10 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-lg tracking-widest text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-center font-bold"
                />
              </div>
              {otpForm.formState.errors.whatsappOtp && (
                <p className="mt-1 text-xs text-rose-500 text-center">
                  {otpForm.formState.errors.whatsappOtp.message}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={otpForm.formState.isSubmitting}
            className="w-full mt-4 py-2.5 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-70 transition-all"
          >
            {otpForm.formState.isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              'Verify & Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setStep(1)}
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to details
          </button>
        </div>
      </div>
    );
  }

  // View: Detail Intake (Step 1)
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-slate-900">Create an Account</h3>
        <p className="text-sm text-slate-500 mt-1">
          Join to track your budget effortlessly.
        </p>
      </div>

      <form
        onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
        className="space-y-4"
      >
        {registerForm.formState.errors.root && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-lg font-semibold">
            {registerForm.formState.errors.root.message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              {...registerForm.register('name')}
              placeholder="John Doe"
              className="block w-full pl-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          {registerForm.formState.errors.name && (
            <p className="mt-1 text-xs text-rose-500">
              {registerForm.formState.errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              type="email"
              {...registerForm.register('email')}
              placeholder="you@example.com"
              className="block w-full pl-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          {registerForm.formState.errors.email && (
            <p className="mt-1 text-xs text-rose-500">
              {registerForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              type="password"
              {...registerForm.register('password')}
              placeholder="••••••••"
              className="block w-full pl-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          {registerForm.formState.errors.password && (
            <p className="mt-1 text-xs text-rose-500 leading-snug">
              {registerForm.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-center text-sm font-medium text-slate-700 mb-1 gap-2">
            WhatsApp Number{' '}
            <span className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">
              Optional
            </span>
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Provide a number if you'd like free instant budget alerts via
            WhatsApp.
          </p>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              type="tel"
              {...registerForm.register('phoneNumber')}
              placeholder="+12345678900"
              className="block w-full pl-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          {registerForm.formState.errors.phoneNumber && (
            <p className="mt-1 text-xs text-rose-500">
              {registerForm.formState.errors.phoneNumber.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={registerForm.formState.isSubmitting}
          className="w-full mt-4 py-2.5 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-70 transition-all flex justify-center items-center"
        >
          {registerForm.formState.isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Continue to Verification'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex justify-center items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Login
        </Link>
      </div>
    </div>
  );
};