import React, { useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { Box as BoxIcon, Key, Plug2, Package } from 'lucide-react';
import StatCard from './StatCard';
import RecentAssets from './RecentAssets';
import AssetStatus from './AssetStatus';
import { useParams } from 'react-router';

function CustomDashboard() {
  const currentDashboardId = useParams().dashboardId || "main";
  console.log(currentDashboardId);
  
  const stats = [
    { title: 'Total Assets', value: '2,547', icon: <BoxIcon />, color: '#1976d2' },
    { title: 'Active Licenses', value: '1,345', icon: <Key />, color: '#2e7d32' },
    { title: 'Accessories', value: '856', icon: <Plug2 />, color: '#9c27b0' },
    { title: 'Consumables', value: '432', icon: <Package />, color: '#ed6c02' },
  ];

  return (
    <Box>
      <p>{currentDashboardId}</p>
      <Grid container spacing={3}>
            {stats.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.title}>
                <StatCard {...stat} />
              </Grid>
            ))}
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Recent Assets</Typography>
                <RecentAssets />
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Asset Status</Typography>
                <AssetStatus />
              </Paper>
            </Grid>
          </Grid>
    </Box>
  );
}

export default CustomDashboard;