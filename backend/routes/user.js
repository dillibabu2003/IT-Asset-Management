const {Router}=require('express');

const {createUser}=require('../controllers/user');
const { profilePicUpload } = require('../middlewares/multer');
// const authMiddleware=require('../middlewares/authMiddleWare');

const userRouter=Router();
userRouter.post('/create',profilePicUpload.single("profile_pic"),createUser);

module.exports=userRouter;