const {Router} = require('express');

const {handleLogin, handleLogout, handleRefreshAccessToken, handleResetPassword} = require('../controllers/auth');

const authRouter = Router();
authRouter.post("/login",handleLogin);
authRouter.get("/logout",handleLogout);
authRouter.post("/refresh-access-token",handleRefreshAccessToken);
authRouter.patch('/forgot-password',handleResetPassword);
module.exports=authRouter;