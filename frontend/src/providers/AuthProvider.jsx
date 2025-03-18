import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import axiosInstance from "../utils/axios.js";
import { useNavigate } from "react-router";
import PropTypes from "prop-types";

const AuthContext = createContext();

const AuthProvider = (props) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        email: email,
        password: password,
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

  const checkAuthStatus = useCallback(async () => {
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
      if (error.status == 401) {
        navigate("/login", { replace: true });
      }
    }
    return false;
  }, [navigate]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, checkAuthStatus }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
