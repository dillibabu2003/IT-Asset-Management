const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const Permission = require("../models/permission");
const asyncHandler = require("../utils/asyncHandler");
const { userSchema } = require("../utils/schemas");
const cleanedEnv = require("../utils/cleanedEnv");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { encryptData} = require("../utils/encrypt");
const UserVisibility = require("../models/userPreference");
const { uploadFileToS3 } = require("./services");
const mongoose = require("mongoose");
const { hitEmailServerApi } = require("../services/email");
const { EMAIL_TYPES } = require("../utils/constants");

const initailizeAllObjectsFieldsAsVisibleWithUserid = async (userId,session) => {
      const userVisibility = new UserVisibility({
            _id: new mongoose.Types.ObjectId(),
            user_id: userId,
            visible_fields: {
                  assets: {
                      "invoice_id": true,
                      "checkout_id": true,
                      "ram": true,
                      "storage": true,
                      "processor": true,
                      "os_type": true,
                      "start": true,
                      "end": true,
                      "warranty": true,
                      "make": true,
                      "model": true,
                      "status": true,
                      "serial_no": true,
                      "asset_id": true,
                      "date_of_received": true,
                      "name_of_the_vendor": true,
                  },
                  licenses: {
                      "license_id": true,
                      "date_of_received": true,
                      "name_of_the_vendor": true,
                      "invoice_id": true,
                      "make": true,
                      "model": true,
                      "start": true,
                      "end": true,
                      "warranty": true,
                      "status": true,
                  },
                  invoices: {
                      "invoice_id": true,
                      "date_of_upload": true,
                      "date_of_received": true,
                      "name_of_the_vendor": true,
                      "amount": true,
                      "status": true,
                  },
              },
      },{session: session});
      await userVisibility.save({session: session});
      return userVisibility;
} 

const createUser = asyncHandler(async (req, res) => {
      const data = userSchema.parse(req.body);
      const session = await mongoose.startSession();
      session.startTransaction();
      const existingUser = await User.findOne({ $or: [{ email: data.email }, { user_id: data.user_id }] });
      if (existingUser) {
            throw new ApiError(400, null, "User with email or user_id  exists");
      }
      const user = new User({_id: new mongoose.Types.ObjectId(), ...data}, {session: session});
      user.profile_pic = `https://${cleanedEnv.S3_BUCKET_NAME}.s3.${cleanedEnv.S3_REGION}.amazonaws.com/${cleanedEnv.S3_PROFILE_PIC_FOLDER}/default.png`;

      const fileName = req.user.id;
      const fileExtension = path.extname(req.file?.originalname || "default.png");

      const localUploadsDirectory = path.join(path.resolve(__dirname), "..", "uploads", "profile-pics");
      const localFilePath =  path.join(localUploadsDirectory, `${fileName}${fileExtension}`);

      const isFileExistsLocally = fs.existsSync(localFilePath);

      if (isFileExistsLocally) {
            const objectKey = `${cleanedEnv.S3_PROFILE_PIC_FOLDER}/${fileName}${fileExtension}`;
            const {s3Response} = await uploadFileToS3(localFilePath, cleanedEnv.S3_BUCKET_NAME, objectKey);
            if (s3Response?.$metadata.httpStatusCode == 200) {
                  
                  user.profile_pic = `https://${cleanedEnv.S3_BUCKET_NAME}.s3.${cleanedEnv.S3_REGION}.amazonaws.com/${objectKey}`;
            }
            fs.unlinkSync(localFilePath);
      }
      const emailBodyData = {password: encryptData(data.password)};
      const {emailResponse,error} = await hitEmailServerApi(cleanedEnv.EMAIL_API,EMAIL_TYPES.VERIFY_EMAIL,data.email,emailBodyData);
      if(error || !emailResponse.success){
            throw new ApiError(500, null, "Unable to create user. Failed to send email verification link");
      }
      console.log(user)
      const userInfo = await user.save({session: session});
      await initailizeAllObjectsFieldsAsVisibleWithUserid(userInfo._id,session);
      await session.commitTransaction();
      session.endSession();

      delete user.password;
      delete user.__v;
      delete user._id;
      res.status(201).json(new ApiResponse(201, { user }, "User created successfully."));
});


const getOtherUserData = asyncHandler(async (req, res) => {
      const userId = req.body.user_id;

      const userData = await User.findOne({ user_id: userId });
      if (!userData) {
            throw new ApiError(400, null, "Invalid user id");
      }
      res.status(200).json(new ApiResponse(200, userData, "User data fetched Successfully"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
      const userId = req.body.user_id;
      console.log(req.body);
      console.log("User id:", userId);
      const userData = await User.findOneAndUpdate({ user_id: userId }, req.body);
      if (!userData) {
            throw new ApiError(400, null, "Invalid user id");
      }
      res.status(200).json(new ApiResponse(200, userData, "User updated successfully"));
})
const deleteUser = asyncHandler(async (req, res) => {
      const userId = req.body.user_id;
      console.log("User id:", userId);
      const deletedUser = await User.findOneAndDelete({ user_id: userId });
      if (!deletedUser) {
          throw new ApiError(404, null, "User not found");
      }
      return res.status(200).json(new ApiResponse(200, null, "User Deleted Successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
      const userId = req.user.id;
      const user = await User.findOne({ user_id: userId });
      if (!user) {
            throw new ApiError(401, null, "Invalid user id");
      }
      const filteredUserInfo = user.toJSON();
      delete filteredUserInfo.password;
      const permissionDocument = await Permission.findOne({ role: user.role });
      filteredUserInfo.permissions = permissionDocument.permissions;
      res.status(200).json(new ApiResponse(200, filteredUserInfo, "User data fetched Successfully"));

})
const getAllUsers = asyncHandler(async (req, res) => {
      const users = await User.find({}).select("-_id -__v -password");
      res.status(200).json(new ApiResponse(200, users, "Users fetched successfully."));
  });

  const searchUsers=asyncHandler(async(req,res)=>{
      const {searchKey} = req.params
      console.log("Search Key:",searchKey);
      const users = await User.aggregate([
            {
                  $search: {
                      index: "UserIndex",
                      text: {
                        query: searchKey,
                        path: ["firstname", "lastname", "fullname", "email", "user_id", "role"],
                        fuzzy: {
                              prefixLength: 2,
                              maxEdits: 2,
                        }
                      }
                  }
           } 
      ]);
      res.status(200).json(new ApiResponse(200,users,"Users fetched successfully."));
  });

module.exports = { createUser, getOtherUserData, deleteUser, updateUserDetails, getUserProfile,getAllUsers,searchUsers};