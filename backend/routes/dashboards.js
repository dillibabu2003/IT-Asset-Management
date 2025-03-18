const express = require("express");
const authorizeClient = require("../middlewares/authorizeClient");
const {
  handleGetDashboardMetadata,
  handleGetDashboardData,
  handleConfigureDashboard,
} = require("../controllers/dashboards");

const dashboardRouter = express.Router();
dashboardRouter.get(
  "/:dashboardId/metadata",
  (req, res, next) => {
    authorizeClient([`edit:${req.params.dashboardId}`])(req, res, next);
  },
  handleGetDashboardMetadata,
);
dashboardRouter.get(
  "/:dashboardId",
  (req, res, next) => {
    authorizeClient([`view:${req.params.dashboardId}`])(req, res, next);
  },
  handleGetDashboardData,
);
dashboardRouter.post(
  "/:dashboardId/configure",
  (req, res, next) => {
    authorizeClient([`edit:${req.params.dashboardId}`])(req, res, next);
  },
  handleConfigureDashboard,
);

module.exports = dashboardRouter;
