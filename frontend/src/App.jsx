import React from 'react';
// import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import "./App.css";
import { MainLayout } from './layouts/MainLayout';
import { Routes, Route, Link } from 'react-router';
import LandingPage from './pages/Landing';
import SignInPage from './pages/SignIn';
import DashboardPage from './pages/Dashboard';
import AssetsPage from './pages/Assets';
import LicensePage from './pages/Licenses';
import InvoicesPage from './pages/Invoices';
import CheckoutPage from './pages/Checkout';
import UserPage from './pages/User';

import CreateUser from './components/CreateUser';
import ManageUsers from './components/ManageUser';

import ProtectedRoute from './protectors/ProtectedRoute';
import NotFound from './pages/NotFound';
import ProtectedComponent from './protectors/ProtectedComponent';
import { PERMISSIONS } from './utils/constants';


export const LinkBehavior = React.forwardRef((props, ref) => {
  const { href, ...other } = props;
  return <RouterLink ref={ref} to={href} {...other} />;
});

function App() {
  return (
    
      <Routes>
        //Home Page Here
        <Route index element={<LandingPage/>} />
        //Login Page Here
        <Route path="/login" element={<SignInPage/>} />


        //Protected Routes to be configured.
        <Route element={<ProtectedRoute ><MainLayout /></ProtectedRoute>}>
        {/* dashboard routes */}
          <Route path="/dashboard" element={<DashboardPage />}>
            <Route path=":dashboardId" element={<DashboardPage />} />
          </Route>

        {/* asset routes */}
          <Route path="/assets" element={<ProtectedComponent requiredPermission={PERMISSIONS.VIEW_ASSETS} redirect={true}><AssetsPage/></ProtectedComponent>} />
          <Route path="/licenses" element={<ProtectedComponent requiredPermission={PERMISSIONS.VIEW_LICENSES} redirect={true}><LicensePage/></ProtectedComponent>} />
          <Route path="/checkouts" element={<ProtectedComponent requiredPermission={PERMISSIONS.VIEW_CHECKOUTS} redirect={true}><CheckoutPage/></ProtectedComponent>} />
          <Route path="/invoices" element={<ProtectedComponent requiredPermission={PERMISSIONS.VIEW_INVOICES} redirect={true}><InvoicesPage/></ProtectedComponent>} />
          <Route path="/users">
            <Route path="create" element={<ProtectedComponent requiredPermission={PERMISSIONS.CREATE_USERS} redirect={true}><CreateUser/></ProtectedComponent>}/>
            <Route path="manage" element={<ProtectedComponent requiredPermission={PERMISSIONS.VIEW_USERS} redirect={true}><ManageUsers/></ProtectedComponent>}/>
            <Route path=":userId" element={"User with some id"} />
          </Route>
              {/* error routes */}
            
        </Route>
          <Route path="*" element={<NotFound/>} />
      </Routes>

  );
}

export default App;