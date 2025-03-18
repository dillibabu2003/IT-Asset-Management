const cleanedEnv = require("../utils/cleanedEnv");
const MONGO_URI = cleanedEnv.MONGO_URI;
const mongoose = require("mongoose");

const connectToDB = mongoose.connect(MONGO_URI, {
  dbName: cleanedEnv.DB_NAME,
});
module.exports = connectToDB;
