import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom"
import { registerSchema, type RegisterForm } from "../utils/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "../services/authService";
import { setCredentials } from "../store/slices/authSlice";

export const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { register, handleSubmit, formState: {errors, isSubmitting}, setError} = useForm<RegisterForm>({resolver: zodResolver(registerSchema)})

    const onSubmit = async(data: RegisterForm)=>{
        try{
            const response = await authService.register(data);
            dispatch(setCredentials(response.user))
            navigate('/dashboard')
        } catch(error: any){
            setError('root', {
                message: error.response?.data?.message || 'Registration failed',
            });
        }
    }
    return (
        <>
        <form onSubmit={handleSubmit(onSubmit)}>
            <h2>Register</h2>
            {errors.root && <p style={{ color: 'red' }}>{errors.root.message}</p>}

            <label>Name</label>
            <input type="text" {...register("name")}/>
            {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}

            <label>Email</label>
            <input type="email" {...register("email")}/>
            {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}

            <label>Password</label>
            <input type="password" {...register("password")}/>
            {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}

            <button type="submit" disabled={isSubmitting} >{isSubmitting ? 'Registering...' : 'Register'}</button>
            <p>Already have an account? <Link to="/login">Login here</Link></p>

        </form>
        </>
    )
}