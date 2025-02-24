const {Router} = require('express');

const {handleLogin} = require('../controllers/auth');

const authRouter = Router();
authRouter.post("/login",handleLogin);

module.exports=authRouter;