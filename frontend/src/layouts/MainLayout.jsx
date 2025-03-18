import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router";
import { Box, Toolbar } from "@mui/material";
import ProtectedRoute from "../protectors/ProtectedRoute";
export const MainLayout = () => {
  const [toggleSideBar, setToggleSideBar] = React.useState(false);
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Header toggleSidebar={setToggleSideBar} />
      <Sidebar toggleSideBar={setToggleSideBar} isSideBarOpen={toggleSideBar} />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        </Box>
      </Box>
    </Box>
  );
};
