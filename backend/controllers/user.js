const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const User = require("../models/user");
const Permission = require("../models/permission");
const asyncHandler = require("../utils/asyncHandler");
const { userSchema } = require("../utils/schemas");
const cleanedEnv = require("../utils/cleanedEnv");
const { fullAccess } = require("../utils/constants")
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { encryptData, decryptData } = require("../utils/encrypt");


const client = new S3Client({
      credentials: {
            accessKeyId: cleanedEnv.AWS_ACCESS_KEY,
            secretAccessKey: cleanedEnv.AWS_SECRET_KEY
      },
      region: cleanedEnv.S3_REGION
})
const uploadFileToS3 = async (filePath, bucketName, key) => {
      const fileStream = fs.createReadStream(filePath);
      const input = {
            Bucket: bucketName,
            Key: key,
            Body: fileStream,
      };
      try {
            return await client.send(new PutObjectCommand(input));
      } catch (err) {
            console.error("Error uploading file to S3:", err);
      }
};
const createUser = asyncHandler(async (req, res) => {
      const data = userSchema.parse(req.body);
      if (!fullAccess.includes(req.user.role) || !data.user_id == req.user.id) {
            throw new ApiError(401, null, "Unauthorized Access");
      }
      const existingUser = await User.findOne({ $or: [{ email: data.email }, { user_id: data.user_id }] });
      if (existingUser) {
            throw new ApiError(400, null, "User with email or user_id  exists");
      }
      const user = new User(data);
      const fileName = req.user.id;
      // return ;
      let filePath = "";
      let isFileUploaded = false;
      if(req.file){
            const fileExtension = path.extname(req.file?.originalname);
            filePath = path.join(path.resolve(__dirname), "..", "uploads", "profile-pics", `${fileName}${fileExtension}`);
      }
      const bucketName = cleanedEnv.S3_BUCKET_NAME;
      const folder = "profile-pics";
      if (fs.existsSync(filePath)) {
            const key = `${folder}/${data.user_id}${fileExtension}`;
            const s3Response = await uploadFileToS3(filePath, bucketName, key);
            if (s3Response?.$metadata.httpStatusCode == 200) {
                  user.profile_pic = `https://${cleanedEnv.S3_BUCKET_NAME}.s3.${cleanedEnv.S3_REGION}.amazonaws.com/${folder}/${data.user_id}${fileExtension}`;
                  isFileUploaded = true;
             }
      }
      else{
            user.profile_pic = `https://${cleanedEnv.S3_BUCKET_NAME}.s3.${cleanedEnv.S3_REGION}.amazonaws.com/${folder}/default.png`;
      }
      let isMailSent=false;

      await user.save();

      try {
            const emailResponse = await fetch(cleanedEnv.EMAIL_API, {
                  method: "POST",
                  headers: {
                        "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                        "type": "verify-email",
                        "email": user.email,
                        "data": {
                              password: encryptData(user.password)
                        }
                  })
            });//if email is not sent by email server try manually using a cron with api key. (cron access only for permission cron:use)
            const emailData = await emailResponse.json();
            if(emailData.success){
                  isMailSent=true;
            }
            delete user.password;
            delete user.__v;
            delete user._id;
            let message = "User created successfully.\n";
            message+=isMailSent ? "Email verification link sent successfully.\n" : "Failed to send email verification link.\n";
            message+=isFileUploaded ? "Image uploaded successfully." : filePath ? "Failed to upload image try again." : "Default image used.";
            res.status(201).json(new ApiResponse(201, { user }, message));

      } catch (error) {
            console.error(error);
            let message = "User created successfully.\nFailed to send email verification link.";
            if(s3Response?.$metadata.httpStatusCode != 200){
                  message+="Failed to upload image try again.";
            }
            res.status(201).json(new ApiResponse(201, { user }, message));
      }
      finally{
            fs.unlinkSync(filePath);
      }
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
      await User.findOneAndDelete({ user_id: userId });
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
      const users=await User.aggregate([
            {
                  $search:{
                      index:"UserIndex",
                      text:{
                        query:searchKey,
                        path:["firstname","lastname","fullname","email","user_id","role"],
                        fuzzy:{
                              prefixLength:3
                        }
                      }
                  }
           } 
      ]);
      res.status(200).json(new ApiResponse(200,users,"Users fetched successfully."));
  });

module.exports = { createUser, getOtherUserData, deleteUser, updateUserDetails, getUserProfile,getAllUsers,searchUsers};