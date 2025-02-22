const mongoose = require("mongoose");

const LicenseSchema = new mongoose.Schema({
  license_id: {
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
    ref: "Invoice",
    required: true,
  },
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String, 
    required: true,
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
    enum: ["available", "activated", "expired", "about_to_expire"],
    required: true,
  },
});

LicenseSchema.virtual("checkout", {
  ref: "Checkouts",
  localField: "_id",
  foreignField: "license_id",
  justOne: true,
});

module.exports = mongoose.model("License", LicenseSchema);
