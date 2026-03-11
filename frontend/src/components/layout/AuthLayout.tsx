import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { Navigate, Outlet } from "react-router-dom";

export const AuthLayout = () =>{
    const {isAuth} = useSelector((state: RootState)=> state.auth)
    if (isAuth){
        return <Navigate to='/dashboard' replace/>
    }
    return(
        <div>
            <h1>Welcome to Smart Expense Tracker</h1>
            <Outlet /> 
        </div>
    )
}