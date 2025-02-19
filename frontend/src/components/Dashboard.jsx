import React, { useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { Box as BoxIcon, Key, Plug2, Package } from 'lucide-react';
import StatCard from './StatCard';
import RecentAssets from './RecentAssets';
import AssetStatus from './AssetStatus';
import DashboardNav from './DashboardNav';

function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);

  // tiles  --> stats

  const stats = [
    { title: 'Total Assets', value: '2,547', icon: <BoxIcon />, color: '#1976d2' },
    { title: 'Active Licenses', value: '1,345', icon: <Key />, color: '#2e7d32' },
    { title: 'Accessories', value: '856', icon: <Plug2 />, color: '#9c27b0' },
    { title: 'Consumables', value: '432', icon: <Package />, color: '#ed6c02' },
  ];

  // const renderContent = () => {
  //   switch (activeTab) {
  //     case 0:
  //       return (
          
  //       );
  //     default:
  //       return (
  //         <Paper sx={{ p: 3 }}>
  //           <Typography>Content for this section is under development</Typography>
  //         </Paper>
  //       );
  //   }
  // };

  return (
    <Box>
      {/* <DashboardNav value={activeTab} onChange={(_, value) => setActiveTab(value)} /> */}
      {/* {renderContent()} */}
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

export default Dashboard;