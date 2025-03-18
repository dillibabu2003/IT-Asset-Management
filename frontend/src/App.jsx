import React from "react";
import "./App.css";
import { MainLayout } from "./layouts/MainLayout";
import { Routes, Route } from "react-router";
import LandingPage from "./pages/Landing";
import SignInPage from "./pages/SignIn";
import DashboardPage from "./pages/Dashboard";
import AssetsPage from "./pages/Assets";
import LicensePage from "./pages/Licenses";
import InvoicesPage from "./pages/Invoices";
import CreateUser from "./components/CreateUser";
import ManageUsers from "./components/ManageUsers";

import ProtectedRoute from "./protectors/ProtectedRoute";
import NotFound from "./pages/NotFound";
import ProtectedComponent from "./protectors/ProtectedComponent";
import { PERMISSIONS } from "./utils/constants";
import { Toaster } from "react-hot-toast";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ActivateAccount from "./pages/ActivateAccount";
import ForgotPassword from "./pages/ForgotPasswod";
import AuthProvider from "./providers/AuthProvider";
import UserProfile from "./pages/UserProfile";
import ExcelImport from "./pages/ExcelImport";
import { createTheme, ThemeProvider } from "@mui/material";

import { Link as RouterLink } from "react-router";
import PropTypes from "prop-types";

export const LinkBehavior = React.forwardRef((props, ref) => {
  const { href, ...other } = props;
  return <RouterLink ref={ref} to={href} {...other} />;
});

LinkBehavior.displayName = "LinkBehavior";

LinkBehavior.propTypes = {
  href: PropTypes.string.isRequired,
};
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#9c27b0",
      light: "#ba68c8",
      dark: "#7b1fa2",
    },
    background: {
      default: "#f8f9fa",
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  table: {
    head: {
      backgroundColor: "black",
    },
  },
});
function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          {/* Home Page Here */}
          <Route index element={<LandingPage />} />
          {/* Login Page Here */}
          <Route
            path="/login"
            element={
              <AuthProvider>
                <SignInPage />
              </AuthProvider>
            }
          />
          <Route path="/verify-email/:id" element={<ActivateAccount />} />
          <Route
            path="/forgot-password/:email/:code"
            element={<ForgotPassword />}
          />

          {/* Protected Routes */}
          <Route
            element={
              <AuthProvider>
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              </AuthProvider>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />}>
              <Route path=":dashboardId" element={<DashboardPage />} />
            </Route>
            <Route path="/assets">
              <Route
                index
                element={
                  <ProtectedComponent
                    requiredPermission={PERMISSIONS.VIEW_ASSETS}
                    redirect={true}
                  >
                    <AssetsPage />
                  </ProtectedComponent>
                }
              />
              <Route
                path="import"
                element={
                  <ProtectedComponent
                    requiredPermission={PERMISSIONS.CREATE_ASSETS}
                    redirect={true}
                  >
                    <ExcelImport objectId="assets" />
                  </ProtectedComponent>
                }
              />
            </Route>
            <Route path="/licenses">
              <Route
                index
                element={
                  <ProtectedComponent
                    requiredPermission={PERMISSIONS.VIEW_LICENSES}
                    redirect={true}
                  >
                    <LicensePage />
                  </ProtectedComponent>
                }
              />
              <Route
                path="import"
                element={
                  <ProtectedComponent
                    requiredPermission={PERMISSIONS.VIEW_LICENSES}
                    redirect={true}
                  >
                    <ExcelImport objectId="licenses" />
                  </ProtectedComponent>
                }
              />
            </Route>
            <Route
              path="/invoices"
              element={
                <ProtectedComponent
                  requiredPermission={PERMISSIONS.VIEW_INVOICES}
                  redirect={true}
                >
                  <InvoicesPage />
                </ProtectedComponent>
              }
            />
            <Route path="/users">
              <Route
                path="create"
                element={
                  <ProtectedComponent
                    requiredPermission={PERMISSIONS.CREATE_USERS}
                    redirect={true}
                  >
                    <CreateUser />
                  </ProtectedComponent>
                }
              />
              <Route
                path="manage"
                element={
                  <ProtectedComponent
                    requiredPermission={PERMISSIONS.EDIT_USERS}
                    redirect={true}
                  >
                    <ManageUsers behavior="edit" />
                  </ProtectedComponent>
                }
              />
              <Route
                path="view"
                element={
                  <ProtectedComponent
                    requiredPermission={PERMISSIONS.VIEW_USERS}
                    redirect={true}
                  >
                    <ManageUsers behavior="view" />{" "}
                  </ProtectedComponent>
                }
              />
              <Route
                path="view/:userId"
                element={
                  <ProtectedComponent
                    requiredPermission={PERMISSIONS.VIEW_USERS}
                    redirect={true}
                  >
                    some user with some id in params
                  </ProtectedComponent>
                }
              />
            </Route>
            <Route path="/user">
              <Route path="profile" element={<UserProfile />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
export default App;
