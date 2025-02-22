const mongoose = require("mongoose");

const CheckOutItemSchema = new mongoose.Schema({
  checkout_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Checkouts",
    required: true,
    unique: true,
  },
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "item_type",
    required: true,
    unique: true,
  },
  item_type: {
    type: String,
    enum: ["Assets", "Licenses"],
    required: true,
  },
  date_of_checkout: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("CheckOutItem", CheckOutItemSchema);
