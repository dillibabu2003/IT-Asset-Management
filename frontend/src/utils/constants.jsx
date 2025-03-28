import Icon from "../components/Icon";

export const PAGE_LIMIT = 10;
export const BACKGROUND_COLORS = [
  "#1976d2",
  "#dc004e",
  "#00838f",
  "#388e3c",
  "#f57c00",
  "#7b1fa2",
  "#c2185b",
  "#512da8",
  "#303f9f",
  "#1976d2",
  "#1976d2",
  "#dc004e",
  "#00838f",
  "#388e3c",
  "#f57c00",
  "#7b1fa2",
  "#c2185b",
  "#512da8",
  "#303f9f",
  "#1976d2",
  "#1976d2",
  "#dc004e",
  "#00838f",
  "#388e3c",
  "#f57c00",
  "#7b1fa2",
  "#c2185b",
  "#512da8",
  "#303f9f",
  "#1976d2",
];
export const ICONS = [
  "rocket",
  "activity",
  "check-circle",
  "circle-dollar-sign",
  "laptop",
  "hard-drive",
  "server",
  "cloud",
  "database",
  "network",
  "monitor",
  "user",
  "package",
  "check-square",
  "file-lock",
  "clipboard-list",
  "external-link",
  "tag",
  "trash",
  "settings",
  "upload-cloud",
  "alert-triangle",
  "refresh-ccw",
  "cpu",
  "usb",
  "archive",
  "printer",
  "share-2",
  "lock",
  "key",
  "file-text",
  "play-circle",
  "columns-2",
  "home",
  "dollar-sign",
  "briefcase",
  "link",
  "camera",
  "bar-chart",
  "zap",
  "file-check",
  "credit-card",
  "file-plus",
];

export const PERMISSIONS = {
  VIEW_DASHBOARD: "view:dashboard",
  EDIT_DASHBOARD: "edit:dashboard",
  VIEW_INVOICES_DASHBOARD: "view:invoices:dashboard",
  VIEW_LICENSES_DASHBOARD: "view:licenses:dashboard",
  VIEW_ASSETS_DASHBOARD: "view:assets:dashboard",
  VIEW_USERS: "view:users",
  VIEW_ASSETS: "view:assets",
  VIEW_LICENSES: "view:licenses",
  VIEW_INVOICES: "view:invoices",
  VIEW_CHECKOUTS: "view:checkouts",
  EDIT_INVOICES_DASHBOARD: "edit:invoices:dashboard",
  EDIT_LICENSES_DASHBOARD: "edit:licenses:dashboard",
  EDIT_ASSETS_DASHBOARD: "edit:assets:dashboard",
  EDIT_USERS: "edit:users",
  EDIT_ASSETS: "edit:assets",
  EDIT_LICENSES: "edit:licenses",
  EDIT_INVOICES: "edit:invoices",
  EDIT_CHECKOUTS: "edit:checkouts",
  CREATE_INVOICES_DASHBOARD: "create:invoices:dashboard",
  CREATE_LICENSES_DASHBOARD: "create:licenses:dashboard",
  CREATE_ASSETS_DASHBOARD: "create:assets:dashboard",
  CREATE_USERS: "create:users",
  CREATE_ASSETS: "create:assets",
  CREATE_LICENSES: "create:licenses",
  CREATE_INVOICES: "create:invoices",
  CREATE_CHECKOUTS: "create:checkouts",
  DELETE_INVOICES_DASHBOARD: "delete:invoices:dashboard",
  DELETE_LICENSES_DASHBOARD: "delete:licenses:dashboard",
  DELETE_ASSETS_DASHBOARD: "delete:assets:dashboard",
  DELETE_USERS: "delete:users",
  DELETE_ASSETS: "delete:assets",
  DELETE_LICENSES: "delete:licenses",
  DELETE_INVOICES: "delete:invoices",
  DELETE_CHECKOUTS: "delete:checkouts",
};

export const features = [
  {
    icon: <Icon name="bar-chart-3" size={24} />,
    title: "Real-time Analytics",
    description:
      "Get instant insights into your asset utilization and performance metrics.",
  },
  {
    icon: <Icon name="shield" size={24} />,
    title: "Secure Management",
    description:
      "Enterprise-grade security to protect your valuable asset information.",
  },
  {
    icon: <Icon name="zap" size={24} />,
    title: "Quick Actions",
    description:
      "Streamlined workflows for efficient asset tracking and management.",
  },
  {
    icon: <Icon name="box" size={24} />,
    title: "Asset Tracking",
    description:
      "Keep track of all your assets with detailed history and status updates.",
  },
  {
    icon: <Icon name="key" size={24} />,
    title: "License Management",
    description:
      "Manage software licenses and compliance in one central location.",
  },
  {
    icon: <Icon name="clipboard-list" size={24} />,
    title: "Maintenance Logs",
    description: "Comprehensive maintenance tracking and scheduling system.",
  },
];

export const availableDashboards = [
  {
    id: "assets",
    label: "Assets Dashboard",
  },
  {
    id: "licenses",
    label: "Licenses Dashboard",
  },
  {
    id: "invoices",
    label: "Invoices Dashboard",
  },
];
