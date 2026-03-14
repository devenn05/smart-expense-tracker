import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { Navigate, Outlet } from "react-router-dom";
import { Wallet } from "lucide-react";

export const AuthLayout = () => {
    const {isAuth, isLoading} = useSelector((state: RootState) => state.auth);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-brand-500 font-medium animate-pulse">Loading secure gateway...</p>
            </div>
        );
    }
    
    if (isAuth) {
        return <Navigate to='/dashboard' replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
                <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30 mb-6">
                    <Wallet className="text-white w-8 h-8" />
                </div>
                <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                    Smart Expense Tracker
                </h2>
                <p className="mt-2 text-center text-sm text-slate-500">
                    Your personal finance hub. Secure and private.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/60 sm:rounded-2xl sm:px-10 border border-slate-100">
                    <Outlet /> 
                </div>
            </div>
        </div>
    );
};