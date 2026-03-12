import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { useDispatch } from 'react-redux'
import { authService } from './services/authService'
import { clearCredentials, setCredentials, setLoading } from './store/slices/authSlice'
import { AuthLayout } from './components/layout/AuthLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { CategoriesBudgets } from './pages/CategoriesBudgets';

function App() {
  const dispatch = useDispatch();
  useEffect(()=>{
    // Check if user is logged in upon initial page load
    const verifyUser = async () => {
      try{
        // If the backend accepts the cookie, save the user!
        const response = await authService.getMe();
        dispatch(setCredentials(response.user))
      } catch (error){
        // If the backend rejects the cookie, clear the user!
        dispatch(clearCredentials());
      } finally {
        dispatch(setLoading(false))
      }
    }
    verifyUser()
  }, [dispatch])  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout/>}>
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/register' element={<Register/>}></Route>
          </Route>

          <Route element={<ProtectedRoute/>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/finances" element={<CategoriesBudgets />} />
            <Route path="/transactions" element={<p>Transactions page coming soon!</p>} />
          </Route>

          

          {/* Default catch-all redirects to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
