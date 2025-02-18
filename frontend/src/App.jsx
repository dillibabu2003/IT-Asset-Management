import React, { useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import Dashboard from './components/Dashboard';

import "./App.css";
import { MainLayout } from './layouts/MainLayout';
import { Routes, Route } from 'react-router';

const LinkBehavior = React.forwardRef((props, ref) => {
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
        <Route path="/" element={<MainLayout />}>
          <Route path="/" element={<Dashboard />}>
          </Route>
        </Route>
      </Routes>
    </MuiThemeProvider>
  );
}

export default App;