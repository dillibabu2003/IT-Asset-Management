const mongoose = require("mongoose");

const UserVisibilitySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true,
  },
  visible_fields: {
    type: Map,
    of: Object,
    default: {},
  },
});

module.exports = mongoose.model("UserVisibility", UserVisibilitySchema);
