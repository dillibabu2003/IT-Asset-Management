const {Router}=require('express');

const {createUser, getUserData, deleteUser, updateUserDetails}=require('../controllers/user');
const { profilePicUpload } = require('../middlewares/multer');
// const authMiddleware=require('../middlewares/authMiddleWare');

const userRouter=Router();
userRouter.post('/create',profilePicUpload.single("profile_pic"),createUser);
userRouter.get('/details',getUserData);
userRouter.delete('/delete',deleteUser);
userRouter.put('/update',updateUserDetails);


module.exports=userRouter;