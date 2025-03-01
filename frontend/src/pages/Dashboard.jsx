import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import StatCard from '../components/StatCard';
import axiosInstance from "../utils/axios";
import CustomVisualRender from "../components/CustomVisualRender";

import { Navigate, useParams } from 'react-router';
import Loader from '../components/Loader';
import ConfigureDashboard from '../components/ConfigureDashboard';
import { PERMISSIONS } from '../utils/constants';
import ProtectedComponent from '../protectors/ProtectedComponent';

function DashboardPage() {
    const [data, setData] = useState(null);
    const currentDashboardId = useParams().dashboardId || "main";
    if(!["assets","licenses","invoices","configure"].includes(currentDashboardId)){
        return <Navigate to="/NotFound" replace={true}></Navigate>
    }

    useEffect(() => {
        console.log("Fetching the data of " + currentDashboardId);
        //don't fetch data it is not in backend
        if(currentDashboardId=="configure") return ;
        async function fetchData(id) {
            try {
                const response = await axiosInstance.get(`/dashboards/${id}`);
                let currData = response.data;
                setData(currData.data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchData(currentDashboardId);
    }, [currentDashboardId]);

    if(currentDashboardId == "configure"){
        return <ProtectedComponent requiredPermission={PERMISSIONS.EDIT_DASHBOARD}><ConfigureDashboard /></ProtectedComponent>
    }

    return (
        !data ? <Loader /> :
            <Box>
                <Grid container spacing={3}>
                    {data?.tiles.map((stat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={stat.title}>
                            <StatCard key={stat._id} {...stat} />
                        </Grid>
                    ))}
                </Grid>
                <Grid container mt={3} spacing={3}>
                    {
                        data?.elements.map((element, index) => {
                            return (
                                <Grid item key={index} xs={12} md={element.type == "table" ? 8 : 4}>
                                    <Paper sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>{element.title}</Typography>
                                        <CustomVisualRender key={element._id} element={element} />
                                    </Paper>
                                </Grid>)
                        })
                    }
                </Grid>
            </Box>
    );
}

export default DashboardPage;