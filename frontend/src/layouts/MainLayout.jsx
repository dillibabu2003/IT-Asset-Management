import React from 'react'
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {Outlet} from "react-router";
import { Box, Toolbar } from '@mui/material';
import ProtectedRoute from '../protectors/ProtectedRoute';
export const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Header />
        <Sidebar />
         
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Toolbar /> 
          <Box  sx={{ p: 3 }}>
            <ProtectedRoute>
              <Outlet/>
            </ProtectedRoute>
          </Box>
        </Box>
      </Box>
  )
}
