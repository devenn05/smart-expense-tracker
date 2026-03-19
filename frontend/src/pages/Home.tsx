import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { 
  WalletCards, 
  MessageSquare, 
  Target, 
  ShieldCheck, 
  BellRing, 
  ArrowRight, 
  Zap,
  PieChart
} from 'lucide-react';

import financialAnalysisImg from '../assets/Financial-Analysis.jpg';

export const Home = () => {
  // Toggle CTAs and nav visibility based on session status
  const { isAuth } = useSelector((state: RootState) => state.auth);

  // Landing page feature grid configuration
  const features = [
    {
      icon: <PieChart className="w-6 h-6 text-brand-500" />,
      title: 'Advanced Analytics',
      desc: 'Visualize your spending with dynamic charts and identify patterns using our automated dashboard.'
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-emerald-500" />,
      title: 'WhatsApp and Email Integration',
      desc: 'Receive instant notifications directly on WhatsApp and Email when you approach your budget limits.'
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: 'Spend Prediction',
      desc: 'Our engine detects overspending anomalies and forecasts your end-of-month expenses automatically.'
    },
    {
      icon: <Target className="w-6 h-6 text-rose-500" />,
      title: 'Smart Budgets',
      desc: 'Create custom spending limits for different categories or use our smart presets to start tracking immediately.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand-200 selection:text-brand-900">
      
      {/* Navigation Layer */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                <WalletCards className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">SmartExp</span>
            </div>

            <div className="flex items-center gap-4">
              {isAuth ? (
                <Link to="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:inline-block text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                    Sign in
                  </Link>
                  <Link to="/register" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm shadow-brand-600/20">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full overflow-hidden">
        
        {/* Hero Section: Messaging & Primary CTA */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pb-40 animate-in fade-in duration-700 slide-in-from-bottom-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-semibold mb-6">
                <ShieldCheck className="w-4 h-4" /> Safe, Secure, Private
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                Master your money. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
                  Track every rupee.
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                SmartExp isn't just an expense tracker. It is a powerful financial intelligence tool. With custom category budgeting, dynamic anomaly detection, and instant WhatsApp alerts.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={isAuth ? "/dashboard" : "/register"} className="inline-flex justify-center items-center px-6 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-xl shadow-brand-500/20 transition-all focus:ring-4 focus:ring-brand-500/30">
                  Start tracking for free
                </Link>
                <a href="#how-it-works" className="inline-flex justify-center items-center px-6 py-3.5 border border-slate-200 text-base font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-all hover:border-slate-300">
                  How it works
                </a>
              </div>
            </div>

            {/* Visual Mockup Grid */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none h-[400px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-300/30 blur-[80px] rounded-full z-0"></div>
              
              <div className="relative z-10 w-full bg-white rounded-2xl shadow-2xl border border-slate-200/60 p-6 flex flex-col gap-6 transform lg:-rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">
                {/* Simulated UI components */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                      <div className="w-20 h-4 bg-slate-200 rounded animate-pulse"></div>
                      <div className="w-32 h-6 bg-brand-100 rounded mt-2"></div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <WalletCards className="text-emerald-600 w-5 h-5" />
                    </div>
                </div>
                <div className="flex items-end gap-3 h-32 pt-2">
                    {[30, 70, 45, 90, 60, 100, 50].map((h, i) => (
                      <div key={i} className={`flex-1 rounded-t-sm ${h > 80 ? 'bg-rose-400' : 'bg-brand-400'}`} style={{height: `${h}%`}}></div>
                    ))}
                </div>
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-3 mt-2">
                    <BellRing className="text-rose-500 w-8 h-8 p-1.5 bg-rose-100 rounded" />
                    <div>
                      <p className="text-sm font-bold text-rose-900">Food Limit Exceeded</p>
                      <p className="text-xs font-medium text-rose-700 opacity-80">Check WhatsApp for details</p>
                    </div>
                </div>
              </div>

              <div className="absolute -bottom-8 -left-8 sm:-left-12 z-20 w-48 bg-white p-4 rounded-xl shadow-xl border border-slate-200/80 animate-bounce" style={{animationDuration: '5s'}}>
                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Savings Insight</p>
                 <div className="text-emerald-500 font-extrabold text-2xl">+ ₹8,432</div>
                 <p className="text-xs text-slate-400 font-medium">Under Budget 🎉</p>
              </div>
            </div>

          </div>
        </section>


        {/* Values & Capabilities */}
        <section className="bg-white border-y border-slate-200 py-20 lg:py-28 relative z-20">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Intelligence built in.</h2>
               <p className="mt-4 text-lg text-slate-600">SmartExp connects everything you need into a single platform that understands how to calculate and prevent catastrophic budgeting disasters automatically.</p>
             </div>

             <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {features.map((f, i) => (
                 <div key={i} className="group p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-100 transition-all duration-300 flex flex-col">
                   <div className="w-12 h-12 bg-white rounded-xl flex justify-center items-center shadow-sm border border-slate-200/60 mb-5 group-hover:scale-110 transition-transform">
                      {f.icon}
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                   <p className="text-slate-600 text-sm leading-relaxed flex-1">{f.desc}</p>
                 </div>
               ))}
             </div>
           </div>
        </section>


        {/* Instructional Stepper */}
        <section id="how-it-works" className="py-20 lg:py-28 bg-slate-50 relative z-10 overflow-hidden">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="flex flex-col md:flex-row items-center gap-16">
               <div className="md:w-1/2 flex justify-center relative">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-400/20 blur-[60px] rounded-full z-0"></div>
                   <img 
                      src={financialAnalysisImg}
                      alt="Finance workflow Illustration" 
                      className="relative z-10 filter drop-shadow-xl opacity-90 object-contain h-[350px]"
                   />
               </div>

               <div className="md:w-1/2 space-y-8">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Simplify your budgeting flow in 3 quick steps.</h2>
                  
                  <div className="flex gap-4">
                     <div className="shrink-0 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex justify-center items-center text-lg z-10">1</div>
                        <div className="w-px h-full bg-slate-300 mt-2 min-h-[3rem]"></div>
                     </div>
                     <div className="pb-8 pt-1.5">
                       <h4 className="text-lg font-bold text-slate-900">Sign Up Securely</h4>
                       <p className="text-sm text-slate-600 mt-1 leading-relaxed">Register your account and receive an instant OTP to keep your data safe. Optionally link your WhatsApp for real-time updates.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="shrink-0 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex justify-center items-center text-lg z-10">2</div>
                        <div className="w-px h-full bg-slate-300 mt-2 min-h-[3rem]"></div>
                     </div>
                     <div className="pb-8 pt-1.5">
                       <h4 className="text-lg font-bold text-slate-900">Set Rigid Targets</h4>
                       <p className="text-sm text-slate-600 mt-1 leading-relaxed">Create custom spending limits for different categories or use our smart presets to start tracking immediately.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="shrink-0">
                        <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex justify-center items-center text-lg shadow-lg">3</div>
                     </div>
                     <div className="pt-1.5">
                       <h4 className="text-lg font-bold text-slate-900">Let the Intelligence Run</h4>
                       <p className="text-sm text-slate-600 mt-1 leading-relaxed">Our engine tracks your spending in real-time. If you exceed 40% of your limit, we will instantly alert you via Email and WhatsApp to help you stay on track.</p>
                     </div>
                  </div>

               </div>
             </div>
           </div>
        </section>

      </main>

      <footer className="bg-slate-900 py-12 border-t border-slate-800">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <WalletCards className="text-white opacity-80 w-6 h-6" />
              <span className="font-bold text-lg text-slate-100 tracking-tight">SmartExp Engine</span>
            </div>
            
            <p className="text-slate-400 text-sm">© {new Date().getFullYear()} SmartExp Solutions. All limits tracked flawlessly.</p>
            
            <div className="flex gap-4 text-sm font-semibold">
              {!isAuth && (
                 <>
                   <Link to="/login" className="text-slate-400 hover:text-white transition-colors">Sign In</Link>
                   <span className="text-slate-700">|</span>
                   <Link to="/register" className="text-slate-400 hover:text-white transition-colors">Register</Link>
                 </>
              )}
            </div>
         </div>
      </footer>
    </div>
  );
};