import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux"
import { useNavigate, Link } from "react-router-dom";
import { loginSchema, type LoginForm } from "../utils/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "../services/authService";
import { setCredentials } from "../store/slices/authSlice";

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
        <>
        <form onSubmit={handleSubmit(onSubmit)}>
            <h2>Login</h2>
            {errors.root && <p style={{ color: 'red' }}>{errors.root.message}</p>}

            <label>Email</label>
            <input type="email" {...register("email")}/>
            {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}

            <label>Password</label>
            <input type="password" {...register("password")}/>
            {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}

            <button type="submit" disabled={isSubmitting} >{isSubmitting ? 'Logging in...' : 'Login'}</button>
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </form>
        </>
    )
}