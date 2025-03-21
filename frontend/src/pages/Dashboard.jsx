import { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import StatCard from "../components/StatCard";
import axiosInstance from "../utils/axios";
import CustomVisualRender from "../components/CustomVisualRender";

import { Navigate, useParams } from "react-router";
import Loader from "../components/Loader";
import ConfigureDashboard from "../components/ConfigureDashboard";
import { PERMISSIONS } from "../utils/constants";
import ProtectedComponent from "../protectors/ProtectedComponent";

function DashboardPage() {
  const [data, setData] = useState(null);
  const currentDashboardId = useParams().dashboardId || "main";
  useEffect(() => {
    if (
      !["assets", "licenses", "invoices", "configure"].includes(
        currentDashboardId,
      )
    ) {
      return;
    }

    console.log("Fetching the data of " + currentDashboardId);

    if (currentDashboardId === "configure") return;

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

  if (
    !["assets", "licenses", "invoices", "configure"].includes(
      currentDashboardId,
    )
  ) {
    return <Navigate to="/NotFound" replace={true}></Navigate>;
  }

  if (currentDashboardId == "configure") {
    return (
      <ProtectedComponent requiredPermission={PERMISSIONS.EDIT_DASHBOARD}>
        <ConfigureDashboard />
      </ProtectedComponent>
    );
  }

  return !data ? (
    <Loader />
  ) : (
    <Box>
      <Typography variant="h5" gutterBottom>
        {currentDashboardId.substring(0, 1).toUpperCase() +
          currentDashboardId.substring(1)}{" "}
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {data?.tiles.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <StatCard key={stat._id} {...stat} />
          </Grid>
        ))}
      </Grid>
      <Grid container mt={3} spacing={3}>
        {data?.elements.map((element, index) => {
          return (
            <Grid item key={index} xs={12} md={element.type == "table" ? 8 : 4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {element.title}
                </Typography>
                <CustomVisualRender key={element._id} element={element} />
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default DashboardPage;
