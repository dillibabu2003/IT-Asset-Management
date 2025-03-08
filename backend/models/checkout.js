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
    type: String,
    ref: "Employee",
    localField: "employee_id",
    foreignField: "employee_id",
    justOne: true,
    required: true,
  },
});

module.exports = mongoose.model("Checkout", CheckoutSchema);
