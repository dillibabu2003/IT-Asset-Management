const {Router} = require('express');
const authRouter = require('./auth');
const userRouter = require('./user');
const metaDataRouter=require('./metadata')
const authMiddleware=require('../middlewares/authMiddleWare')
const indexRouter = Router();

indexRouter.use("/auth",authRouter);
indexRouter.use("/user",authMiddleware,userRouter);
indexRouter.use("/meta-data",metaDataRouter);

module.exports=indexRouter;