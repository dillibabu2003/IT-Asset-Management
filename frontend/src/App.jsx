import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import "./App.css";
import { MainLayout } from './layouts/MainLayout';
import { Routes, Route, Link } from 'react-router';
import CustomTable from './components/CustomTable';
import CustomDashboard from './components/CustomDashboard';
import LandingPage from './components/Landing';
import SignIn from './components/SignIn';

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
  );
}

export default App;