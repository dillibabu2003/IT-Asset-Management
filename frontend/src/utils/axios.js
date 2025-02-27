import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api/v1",
    timeout: 3000,
    withCredentials: true
});

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        console.log(error);
        
        if (error.response.status === 401 && error.response.data.errors.name === "TokenExpiredError") {
            try {
                await axiosInstance.post("/auth/refresh-access-token");
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                if (refreshError.response.status === 401 && refreshError.response.data.errors.name === "TokenExpiredError") {
                    await axiosInstance.post("/auth/refresh-access-token");
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;