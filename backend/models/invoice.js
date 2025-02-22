const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  invoice_id: {
    type: String,
    required: true,
    unique: true,
  },
  date_of_upload: {
    type: Date,
    required: true,
  },
  date_of_received: {
    type: Date,
    required: true,
  },
  name_of_the_vendor: {
    type: String,
    required: true,
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "rejected", "processed"],
    required: true,
  },
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
