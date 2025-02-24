const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.json({
    limit: "200kb",
}));
app.use(express.urlencoded({
    extended: true,
}));
app.use(cookieParser());

app.use("/api/v1",indexRouter);

module.exports=app;