const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const cleanedEnv = require("../utils/cleanedEnv");

const app = express();

const indexRouter = require("../routes/index");

app.use(
  cors({
    origin: cleanedEnv.CORS_FRONTEND_BASE_URI,
    credentials: true,
  }),
);
// app.use(bodyParser.urlencoded())
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/v1", indexRouter);

module.exports = app;
