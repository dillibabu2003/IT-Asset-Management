const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors=require("cors");

const app = express();

const indexRouter = require('../routes/index');
const bodyParser = require('body-parser');

app.use(cors());
// app.use(bodyParser.urlencoded())
app.use(express.urlencoded({
    extended: false,
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

app.use("/api/v1",indexRouter);

module.exports=app;