const mongoose = require("mongoose");

const UserVisibilitySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  visible_fields: {
    type: Map,
    of: [String],
    default: {},
  },
});

module.exports = mongoose.model("UserVisibility", UserVisibilitySchema);
