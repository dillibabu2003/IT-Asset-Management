const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const app = express();

const indexRouter = require('../routes/index');

app.use(express.json({
    limit: "200kb",
}));
app.use(morgan('dev'));
app.use(express.urlencoded({
    extended: true,
}));
app.use(cookieParser());

app.use("/api/v1",indexRouter);

module.exports=app;