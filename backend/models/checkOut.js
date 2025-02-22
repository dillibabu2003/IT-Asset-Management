const mongoose = require("mongoose");

const CheckoutSchema = new mongoose.Schema({
  checkout_id: {
    type: String,
    required: true,
    unique: true,
  },
  checkedout_items: {
    type: [{
      type: {
        type: String,
        enum: ["asset", "license"],
        required: true,
      },
      qty: {
        type: Number,
        required: true,
      }
    }],
    required: true,
  },
  date_of_checkout: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "rejected", "processed"],
    required: true,
  },
});

module.exports = mongoose.model("Checkout", CheckoutSchema);
