const {Router}=require('express');

const {createUser, getUserData, deleteUser}=require('../controllers/user');
const { profilePicUpload } = require('../middlewares/multer');
// const authMiddleware=require('../middlewares/authMiddleWare');

const userRouter=Router();
userRouter.post('/create',profilePicUpload.single("profile_pic"),createUser);
userRouter.get('/details',getUserData);
userRouter.delete('/delete',deleteUser);


module.exports=userRouter;