import React from 'react';
// import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import "./App.css";
import { MainLayout } from './layouts/MainLayout';
import { Routes, Route } from 'react-router';
import LandingPage from './pages/Landing';
import SignInPage from './pages/SignIn';
import DashboardPage from './pages/Dashboard';
import AssetsPage from './pages/Assets';
import LicensePage from './pages/Licenses';
import InvoicesPage from './pages/Invoices';
import CheckoutPage from './pages/Checkout';

import CreateUser from './components/CreateUser';
import ManageUsers from './components/ManageUser';

import ProtectedRoute from './protectors/ProtectedRoute';
import NotFound from './pages/NotFound';
import ProtectedComponent from './protectors/ProtectedComponent';
import { PERMISSIONS } from './utils/constants';
import VerifyEmail from './pages/VerifyEmail';
import { Toaster } from 'react-hot-toast';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


export const LinkBehavior = React.forwardRef((props, ref) => {
  const { href, ...other } = props;
  return <RouterLink ref={ref} to={href} {...other} />;
});

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
     <Toaster
      position="top-center"
      reverseOrder={false}
    />
      <Routes>
        //Home Page Here
        <Route index element={<LandingPage />} />
        //Login Page Here
        <Route path="/login" element={<SignInPage />} />
        <Route path="/verify-email/:id" element={<VerifyEmail />} />

        //Protected Routes
        <Route element={<ProtectedRoute ><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />}>
            <Route path=":dashboardId" element={<DashboardPage />} />
          </Route>
          <Route path="/assets" element={<ProtectedComponent requiredPermission={PERMISSIONS.VIEW_ASSETS} redirect={true}><AssetsPage /></ProtectedComponent>} />
          <Route path="/licenses" element={<ProtectedComponent requiredPermission={PERMISSIONS.VIEW_LICENSES} redirect={true}><LicensePage /></ProtectedComponent>} />
          <Route path="/checkouts" element={<ProtectedComponent requiredPermission={PERMISSIONS.VIEW_CHECKOUTS} redirect={true}><CheckoutPage /></ProtectedComponent>} />
          <Route path="/invoices" element={<ProtectedComponent requiredPermission={PERMISSIONS.VIEW_INVOICES} redirect={true}><InvoicesPage /></ProtectedComponent>} />
          <Route path="/users">
            <Route path="create" element={<ProtectedComponent requiredPermission={PERMISSIONS.CREATE_USERS} redirect={true}><CreateUser /></ProtectedComponent>} />
            <Route path="manage" element={<ProtectedComponent requiredPermission={PERMISSIONS.EDIT_USERS} redirect={true}><ManageUsers behavior="edit" /></ProtectedComponent>} />
            <Route path="view" element={<ProtectedComponent requiredPermission={PERMISSIONS.VIEW_USERS} redirect={true}><ManageUsers behavior="view" /> </ProtectedComponent>} />
            <Route path="view/:userId" element={<ProtectedComponent requiredPermission={PERMISSIONS.VIEW_USERS} redirect={true}>some user with some id in params</ProtectedComponent>} />
          </Route>

        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LocalizationProvider>
  );
}

export default App;