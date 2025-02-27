import React from 'react';
// import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import "./App.css";
import { MainLayout } from './layouts/MainLayout';
import { Routes, Route, Link } from 'react-router';
import LandingPage from './components/Landing';
import SignIn from './components/SignIn';
import DashboardPage from './pages/Dashboard';
import AssetsPage from './pages/Assets';
import LicensePage from './pages/Licenses';
import InvoicesPage from './pages/Invoices';
import CheckoutPage from './pages/Checkout';
import UserPage from './pages/User';
import CreateUser from './components/CreateUser';
import ManageUsers from './components/ManageUser';

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
        <Route path="/login" element={<SignIn/>} />


        //Protected Routes to be configured.
        <Route element={<MainLayout />}>
        //dashboard routes
          <Route path="/dashboard" element={<DashboardPage />}>
            <Route path=":dashboardId" element={<DashboardPage />} />
          </Route>

        //asset routes
          <Route path="/assets" element={<AssetsPage/>} />
          <Route path="/licenses" element={<LicensePage/>} />
          <Route path="/checkouts" element={<CheckoutPage/>} />
          <Route path="/invoices" element={<InvoicesPage/>} />
          <Route path="/users"  >
            <Route index element={<UserPage/>} />
            <Route path="create" element={<CreateUser/>}/>
            <Route path="manage" element={<ManageUsers/>}/>
            <Route path=":userId" element={"User with some id"} />
          </Route>
            
        </Route>
      </Routes>
  );
}

export default App;