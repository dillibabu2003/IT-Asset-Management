import axios from "axios";
const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api",
    timeout: 3000,
});
export default axiosInstance;