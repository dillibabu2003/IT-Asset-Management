import React, { useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import Dashboard from './components/Dashboard';
import AssetList from './components/AssetList';

import "./App.css";
import { MainLayout } from './layouts/MainLayout';
import { Routes, Route, Link, Outlet } from 'react-router';

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

        //Protected Route
        {/* <Route path="/" element={<MainLayout />}>
        <Route path='/dashboard'>
                  <Route index element={<Dashboard/>}/>
                  <Route path='/asset' element={<AssetList/>}/>
        </Route>
        </Route> */}

        <Route element={<MainLayout />}>
        //dashboard routes
          <Route path="/dashboard">
            <Route index element={<Dashboard />} />
            <Route path=":dashboardId" element={<Dashboard />} />
          </Route>

        //asset routes
          <Route path="/assets">
            <Route index element={<AssetList/>}/>
          </Route>

          
        </Route>
      </Routes>
    </MuiThemeProvider>
  );
}

export default App;