const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
  role: {
    type: String,
    enum:  ["guest","member","admin"],
    required: true
  },
  permissions:{
    assets: {
      dashboard: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    licenses: {
      dashboard: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    invoices: {
      dashboard: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    checkouts: {
      dashboard: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      view: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
  }
});

module.exports = mongoose.model("Permission", PermissionSchema);
