import axios from "axios";
import { store } from "../store/store";
import { clearCredentials } from "../store/slices/authSlice";

const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    withCredentials: true,
    headers:{
        'Content-Type': 'application/json',
    }
})

api.interceptors.response.use(
    (response)=>{
        return response;
    },
    (error)=>{
        if (error.response && error.response.status === 401){
            store.dispatch(clearCredentials());
        }
        return Promise.reject(error);
    }
)

export default api;