const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema({
  serial_no: {
    type: String,
    required: true,
    unique: true,
  },
  asset_id: {
    type: String,
    required: true,
    unique: true,
  },
  date_of_received: {
    type: Date,
    required: true,
  },
  name_of_the_vendor: {
    type: String,
    required: true,
  },
  invoice_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoices",
    required: true,
  },
  checkout_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Checkouts",
  },
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  ram: {
    type: String,
    enum: ["8GB", "16GB", "32GB","64GB","128GB"],
  },
  storage: {
    type: String,
    enum: ["256GB","512GB", "1TB"],
  },
  processor: {
    type: String,
  },
  os_type: {
    type: String,
    enum: ["ubuntu", "windows", "mac"],
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  warranty: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["available", "deployed", "archived", "reissue"],
    required: true,
  },
});

module.exports = mongoose.model("Asset", AssetSchema);
