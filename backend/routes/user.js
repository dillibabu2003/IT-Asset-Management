const {Router}=require('express');

const {createUser, getOtherUserData, deleteUser, updateUserDetails,getUserProfile,getAllUsers,searchUsers}=require('../controllers/user');
const { profilePicUpload } = require('../middlewares/multer');
const authorizeClient = require('../middlewares/authorizeClient');

const userRouter=Router();
userRouter.post('/create',authorizeClient(["create:users"]),profilePicUpload.single("profile_pic"),createUser);
userRouter.get('/details',authorizeClient(["view:users"]),getOtherUserData);
userRouter.get('/all',authorizeClient(["view:users"]),getAllUsers);
userRouter.get('/profile',getUserProfile);
userRouter.delete('/delete',authorizeClient(["delete:users"]),deleteUser);
userRouter.put('/update',authorizeClient(["edit:users"]),updateUserDetails);
userRouter.get('/search/:searchKey',authorizeClient(["view:users"]),searchUsers);

module.exports=userRouter;