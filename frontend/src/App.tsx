import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import { Transactions } from './pages/Transactions';
import { Home } from './pages/Home';
import { ForgotPassword } from './pages/ForgotPassword';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    /**
     * Bootstrap user session on mount.
     * Checks for a valid httpOnly cookie via the /me endpoint.
     */
    const verifyUser = async () => {
      try {
        const response = await authService.getMe();
        // Hydrate store if session is valid
        dispatch(setCredentials(response.user))
      } catch (error) {
        // Fallback to guest state if unauthorized or cookie expired
        dispatch(clearCredentials());
      } finally {
        dispatch(setLoading(false))
      }
    }
    verifyUser()
  }, [dispatch])  

  return (
    <>
      {/* Global notification portal */}
      <Toaster 
        position="top-right" 
        toastOptions={{ 
            duration: 4000,
            style: { background: '#fff', color: '#334155', fontWeight: '500' }
        }} 
      />
      
      <BrowserRouter>
        <Routes>
          {/* Public Landing */}
          <Route path="/" element={<Home />} />

          {/* Guest-only routes (Auth wrapper) */}
          <Route element={<AuthLayout/>}>
            <Route path='/login' element={<Login/>} />
            <Route path='/register' element={<Register/>} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
          </Route>

          {/* Authenticated routes (Guard wrapper) */}
          <Route element={<ProtectedRoute/>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/finances" element={<CategoriesBudgets />} />
            <Route path="/transactions" element={<Transactions />} />
          </Route>

          {/* Catch-all: Redirect unknown paths to dashboard (will trigger login if unauth) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App