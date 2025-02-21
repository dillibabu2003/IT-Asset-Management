import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import "./App.css";
import { MainLayout } from './layouts/MainLayout';
import { Routes, Route, Link } from 'react-router';
import DashboardPage from './pages/Dashboard';
import AssetsPage from './pages/Assets';
import LicensePage from './pages/Licenses';
import InvoicesPage from './pages/Invoices';
import CheckoutPage from './pages/Checkout';
import UserPage from './pages/User';

export const LinkBehavior = React.forwardRef((props, ref) => {
  const { href, ...other } = props;
  return <RouterLink ref={ref} to={href} {...other} />;
});

function App() {
  const theme = createTheme({
    components: {
      MuiLink: {
        defaultProps: {
          component: LinkBehavior,
        },
      },
      MuiButtonBase: {
        defaultProps: {
          LinkComponent: LinkBehavior,
        },
      },
      MuiListItemButton: {
        defaultProps: {
          LinkComponent: LinkBehavior,
        },
      },
      MuiIconButton: {
        defaultProps: {
          LinkComponent: LinkBehavior,
        },
      },
    },
  });

  return (
    <MuiThemeProvider theme={theme}>
      <Routes>
        //Home Page Here
        <Route index element={<Link to='/dashboard'>Go to dashboard</Link>} />
        //Login Page Here
        <Route path="/login" element={"Login here"} />


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
            <Route path="create" element={"create user"}/>
            <Route path=":userId" element={"User with some id"} />
          </Route>
            
        </Route>

      </Routes>
    </MuiThemeProvider>
  );
}

export default App;