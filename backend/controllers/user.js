const User = require("../models/user");
const asyncHandler = require("../utils/asyncHandler");
const { userSchema } = require("../utils/schemas");
const cleanedEnv=require("../utils/cleanedEnv");
const {fullAccess}=require("../utils/constants")
const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand, Permission } = require('@aws-sdk/client-s3');
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");


const client = new S3Client({
      credentials: {
          accessKeyId:cleanedEnv.AWS_ACCESS_KEY,
          secretAccessKey:cleanedEnv.AWS_SECRET_KEY
      },
      region:cleanedEnv.S3_REGION
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
      } finally{
            fs.unlinkSync(filePath)
      }
};
const createUser = asyncHandler(async (req, res) => {
      const data = userSchema.parse(req.body);
      if(!fullAccess.includes(req.user.role) || !data.user_id==req.user.id){
            res.status(401).json(new ApiError(401,null,"Unauthorized Access"));
            return;
      }      
      const user = new User(data);
      const fileName = req.user.id;      
      const fileExtension = path.extname(req.file.originalname);
      const filePath = path.join(path.resolve(__dirname),"..", "uploads", "profile-pics", `${fileName}${fileExtension}`);
      if (fs.existsSync(filePath)) {
            const bucketName = cleanedEnv.S3_BUCKET_NAME;
            const folder="profile-pics";
            const key = `${folder}/${data.user_id}${fileExtension}`;
            const response=await uploadFileToS3(filePath, bucketName, key);
            if(response.$metadata.httpStatusCode==200){
                  user.profile_pic=`https://${cleanedEnv.S3_BUCKET_NAME}.s3.${cleanedEnv.S3_REGION}.amazonaws.com/${folder}/${data.user_id}${fileExtension}`;
            }
            else{
                  user.profile_pic=`https://${cleanedEnv.S3_BUCKET_NAME}.s3.${cleanedEnv.S3_REGION}.amazonaws.com/${folder}/default.png`;
            }
            await user.save();
            delete user.password;
            delete user.__v;
            delete user._id;
            res.status(201).json(new ApiResponse(201,{user},"User created successfully"));
      }else{
            res.status(500).json(new ApiError(500,{error: "Upload failed."},"Upload failed."))
      }      
});

module.exports = { createUser };