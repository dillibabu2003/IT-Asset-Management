const {Router} = require('express');
const indexRouter = Router();

indexRouter.use("/auth",authRouter);

module.exports=indexRouter;