const {Router} = require('express');
const authRouter = require('./auth');
const userRouter = require('./user');
const authMiddleware=require('../middlewares/authMiddleWare')
const indexRouter = Router();

indexRouter.use("/auth",authRouter);
indexRouter.use("/user",authMiddleware,userRouter);

module.exports=indexRouter;