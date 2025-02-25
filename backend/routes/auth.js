const {Router} = require('express');

const {handleLogin, handleLogout, handleRefreshAccessToken} = require('../controllers/auth');

const authRouter = Router();
authRouter.post("/login",handleLogin);
authRouter.get("/logout",handleLogout);
authRouter.post("/refresh-access-token",handleRefreshAccessToken);

module.exports=authRouter;