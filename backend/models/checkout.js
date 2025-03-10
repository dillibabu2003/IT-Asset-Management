const mongoose = require("mongoose");
const { convertPascaleCaseToSnakeCase, convertSnakeCaseToPascaleCase } = require("../utils/helperFunctions");

const CheckoutSchema = new mongoose.Schema({
  checkout_id: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ["assets", "licenses"],
    set: (v) => convertPascaleCaseToSnakeCase(v),
    get: (v) => convertSnakeCaseToPascaleCase(v),
    required: true,
  },
  type_reference_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: function() {
      return this.type==="assets" ? "Asset" : "License";
    },
    required: true,
  },
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
    default: null
  },
});

module.exports = mongoose.model("Checkout", CheckoutSchema);
