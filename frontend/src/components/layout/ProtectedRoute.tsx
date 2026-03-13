import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../../store/store";
import { authService } from "../../services/authService";
import { clearCredentials } from "../../store/slices/authSlice";
import { Navigate, Outlet } from "react-router-dom";
import { Link } from "react-router-dom";

export const ProtectedRoute = () => {
    const dispatch = useDispatch();
    const {user, isAuth, isLoading} = useSelector((state: RootState)=> state.auth)

    const handleLogout = async () =>{
        try{
            await authService.logout();
            dispatch(clearCredentials());
        } catch (error) {
            console.error('Logout failed', error);
        }
    }

    if (isLoading) return <p>Loading app...</p>;
    if (!isAuth) return <Navigate to='/login' replace/>;
    
    return(
        <>
        <nav>
            <Link to="/dashboard" style={{ marginRight: '10px' }}>Dashboard</Link>
            <Link to="/finances" style={{ marginRight: '10px' }}>Manage Finances</Link>
            <Link to="/transactions" style={{ marginRight: '10px' }}>Transactions</Link>
        <p>Logged in as: {user?.name}</p>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <hr />
      <Outlet />
        </>
    );
}