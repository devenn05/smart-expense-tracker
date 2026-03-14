import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../../store/store";
import { authService } from "../../services/authService";
import { clearCredentials } from "../../store/slices/authSlice";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, WalletCards, ArrowRightLeft, LogOut } from "lucide-react";

export const ProtectedRoute = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { user, isAuth, isLoading } = useSelector((state: RootState) => state.auth);

    const handleLogout = async () => {
        try {
            await authService.logout();
            dispatch(clearCredentials());
        } catch (error) {
            console.error('Logout failed', error);
        }
    }

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <p className="text-slate-500 animate-pulse font-medium">Loading workspace...</p>
        </div>
    );

    if (!isAuth) return <Navigate to='/login' replace />;

    const navItems = [
        { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/finances', name: 'Finances', icon: WalletCards },
        { path: '/transactions', name: 'Transactions', icon: ArrowRightLeft },
    ];
    
    return(
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center gap-2 mr-6">
                                <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-md">
                                    <WalletCards className="text-white w-5 h-5" />
                                </div>
                                <span className="font-bold text-lg text-slate-800 hidden sm:block">SmartExp</span>
                            </div>

                            <div className="flex space-x-1 sm:space-x-8 overflow-x-auto">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname.includes(item.path);
                                    
                                    return (
                                        <Link 
                                            key={item.path} 
                                            to={item.path} 
                                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                                                isActive 
                                                ? 'border-brand-500 text-brand-600' 
                                                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
                                            {item.name}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-500 hidden md:block">
                                Hi, <span className="text-slate-900">{user?.name}</span>
                            </span>
                            <button 
                                onClick={handleLogout}
                                className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 text-sm font-medium rounded-lg text-rose-600 bg-white hover:bg-rose-50 hover:border-rose-200 transition-all duration-200"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
                <Outlet />
            </main>
        </div>
    );
}