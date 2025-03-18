const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  invoice_id: {
    type: String,
    required: true,
    unique: true,
  },
  owner_name: {
    type: String,
    // required: true,
  },
  invoice_filename: {
    type: String,
    required: true,
  },
  invoice_date: {
    type: Date,
    required: true,
  },
  upload_date: {
    type: Date,
    required: true,
  },
  vendor_name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  invoice_description: {
    type: String,
  },
  data: {
    type: Map,
    of: Object,
    default: {},
  },
  // status: {
  //   type: String,
  //   enum: ["pending", "rejected", "processed"],
  //   required: true,
  // },
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
