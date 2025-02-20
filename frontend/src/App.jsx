import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import "./App.css";
import { MainLayout } from './layouts/MainLayout';
import { Routes, Route, Link } from 'react-router';
import CustomTable from './components/CustomTable';
import CustomDashboard from './components/CustomDashboard';

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
          <Route path="/dashboard">
            <Route index element={<CustomDashboard />} />
            <Route path=":dashboardId" element={<CustomDashboard />} />
          </Route>
        //asset routes
          <Route path="/assets">
            <Route index element={<CustomTable />} />
          </Route>
        </Route>
        

      </Routes>
    </MuiThemeProvider>
  );
}

export default App;