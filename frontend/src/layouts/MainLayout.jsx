import React from 'react'
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {Outlet} from "react-router";
import { Box, Container, Toolbar } from '@mui/material';
export const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', minWidth: '100vw' }}>
        <Header />
        <Sidebar />
         <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Toolbar /> {/* Add spacing for fixed header */}
          <Box  sx={{ p: 3 }}>
            {/* {renderContent()} */}
            <Outlet/>
          </Box>
        </Box>
      </LocalizationProvider>
      </Box>
  )
}
