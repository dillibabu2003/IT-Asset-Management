import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import StatCard from './StatCard';
import axiosInstance from "../utils/axios";
import CustomVisualRender from "./CustomVisualRender";

import { useParams } from 'react-router';

function CustomDashboard() {
  const [data,setData]=useState(null);
  const currentDashboardId = useParams().dashboardId || "main";
  console.log(currentDashboardId);

  useEffect(()=>{
    console.log("Fetching the data of "+currentDashboardId);
    async function fetchData(id) {
      try {
        const response = await axiosInstance.get(`/${id}`);
        let currData=response.data;
        setData(currData);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData(currentDashboardId);
  },[currentDashboardId]);
  
  // const stats = [
  //   { title: 'Total Assets', value: '2,547', icon: <BoxIcon />, color: '#1976d2' },
  //   { title: 'Active Licenses', value: '1,345', icon: <Key />, color: '#2e7d32' },
  //   { title: 'Accessories', value: '856', icon: <Plug2 />, color: '#9c27b0' },
  //   { title: 'Consumables', value: '432', icon: <Package />, color: '#ed6c02' },
  // ];

  return (
    !data ? <p>Fetching data...</p>:
    <Box>
      <p>{currentDashboardId}</p>
      <Grid container spacing={3}>
            {data?.tiles.map((stat,index) => (
              <Grid item xs={12} sm={6} md={3} key={stat.name}>
                <StatCard {...stat} />
              </Grid>
            ))}
        </Grid>
            {/* <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Recent Assets</Typography>
                <RecentAssets />
              </Paper>
            </Grid> */}
            <Grid container mt={3} spacing={3}>
                {
                  data?.elements.map((element,index)=>{
                return (
            <Grid item key={index} xs={12} md={element.type=="table"?8:4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>{element.name}</Typography>
                    <CustomVisualRender element={element}/>
              </Paper>
            </Grid>)
                  })
                }
                </Grid>
    </Box>
  );
}

export default CustomDashboard;