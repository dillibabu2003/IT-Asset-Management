import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from "../utils/axios.js";
import { useNavigate } from 'react-router';

const AuthContext = createContext();

const AuthProvider = (props) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const login = async (email, password) => {
        try {
            const response = await axiosInstance.post("/auth/login", {
                email: email,
                password: password
            });
            if (response.data.success) {
                console.log(response.data);
                setIsAuthenticated(true);
                setUser(response.data.data);
            }
            return response.data;
        } catch (error) {
            console.log(error);
            return error.response.data;
        }
    };

    const logout = async () => {
        try {
            const response = await axiosInstance.get("/auth/logout");
            if (response.data.success) {
                console.log(response.data);
                setIsAuthenticated(false);
                setUser(null);
            }
            return response.data.data;
        } catch (error) {
            console.log(error);
            return error.response.data;
        }
    };

    const checkAuthStatus = async () => {
        try {
            const response = await axiosInstance.get("/user/profile");
            if (response.data.success) {
                console.log(response.data);
                setIsAuthenticated(true);
                setUser(response.data.data);
                return true;
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.log(error);
            setIsAuthenticated(false);
            setUser(null);
            if(error.status==401){
                navigate("/login",{replace:true});
            }
        }finally{
            return false;
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout,checkAuthStatus }}>
            {props.children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthProvider;