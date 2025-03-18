const mongoose = require("mongoose");

const PermissionEnum = [
  "view:dashboard",
  "edit:dashboard",
  "view:employees",
  "edit:employees",
  "create:employees",
  "delete:employees",
  "view:invoices:dashboard",
  "view:licenses:dashboard",
  "view:assets:dashboard",
  "view:users",
  "view:assets",
  "view:licenses",
  "view:invoices",
  "view:checkouts",
  "edit:invoices:dashboard",
  "edit:licenses:dashboard",
  "edit:assets:dashboard",
  "edit:users",
  "edit:assets",
  "edit:licenses",
  "edit:invoices",
  "edit:checkouts",
  "create:invoices:dashboard",
  "create:licenses:dashboard",
  "create:assets:dashboard",
  "create:users",
  "create:assets",
  "create:licenses",
  "create:invoices",
  "create:checkouts",
  "delete:invoices:dashboard",
  "delete:licenses:dashboard",
  "delete:assets:dashboard",
  "delete:users",
  "delete:assets",
  "delete:licenses",
  "delete:invoices",
  "delete:checkouts",
];

const PermissionSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["guest", "member", "admin"],
    required: true,
  },
  permissions: {
    type: [String],
    enum: PermissionEnum,
  },
});

module.exports = mongoose.model("Permission", PermissionSchema);
