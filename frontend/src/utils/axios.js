import axios from "axios";
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: 50000,
});
export default axiosInstance;