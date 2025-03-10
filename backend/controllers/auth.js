const jwt = require('jsonwebtoken');
 
const asyncHandler = require('../utils/asyncHandler');
const {loginSchema} = require('../utils/schemas');
const User = require('../models/user');
const Permission = require('../models/permission');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const cleanedEnv = require('../utils/cleanedEnv');
const redisClient = require('../config/redis');
const { decryptJWT } = require('../utils/helperFunctions');
const { decryptData } = require('../utils/encrypt');
async function generateAccessTokenAndRefreshToken(user){
    const accessToken = await jwt.sign({_id: user._id,id: user.user_id,email: user.email,role: user.role},cleanedEnv.ACCESS_TOKEN_SECRET,{expiresIn: '1h'});
    const refreshToken = await jwt.sign({_id: user._id,id: user.user_id,email: user.email,role: user.role},cleanedEnv.REFRESH_TOKEN_SECRET,{expiresIn: '2h'});
    //store refreshToken in redis and use it in refreshing the access token.
    await redisClient.set(user.user_id.toString(), refreshToken, {'EX': 2 * 60 * 60}); // 2 hours in seconds
    return [accessToken,refreshToken];
}
 
const handleLogin = asyncHandler(async (req,res,next)=>{
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({email: data.email});
    if(!user || !await user.validatePassword(data.password)) {
        throw new ApiError(401,{error: "Invalid email or password"},"Invalid email or password",)
    }
    else if(user.status!="active"){
        throw new ApiError(400,{error: "Account is inactive or blocked."},"Account is inactive or blocked.",)
    }
    const [accessToken,refreshToken] = await generateAccessTokenAndRefreshToken(user);
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        overwrite: true
    }
    const filteredUserInfo = user.toJSON();
    delete filteredUserInfo.password;
    const permissionDocument = await Permission.findOne({role: user.role});
    filteredUserInfo.permissions=permissionDocument.permissions;
    res
    .status(200)
    .cookie("access_token",accessToken,cookieOptions)
    .cookie("refresh_token",refreshToken,cookieOptions)
    .json(new ApiResponse(200,filteredUserInfo,"Logged in successfully."));
});
 
const handleRefreshAccessToken = asyncHandler(async (req,res,next)=>{
    const refreshToken = req.cookies.refresh_token;
    const decodedInfo = await decryptJWT(refreshToken,cleanedEnv.REFRESH_TOKEN_SECRET);
    if(!refreshToken || !decodedInfo){
        throw new ApiError(400,{error: "Invalid refresh token"},"Invalid refresh token",null);
    }
    const [newAccessToken,newRefreshToken] = await generateAccessTokenAndRefreshToken({_id:decodedInfo._id, user_id: decodedInfo.id, email: decodedInfo.email, role: decodedInfo.role});
    const cookieOptions = {
        httpOnly: true,
        secure: false, //When deployed and assigned a domain with valid ssl/tls certificate make it to true.
        overwrite: true
    }
    res
    .status(200)
    .cookie("access_token", newAccessToken,cookieOptions)
    .cookie("refresh_token",newRefreshToken,cookieOptions)
    .json(new ApiResponse(200, null,"Access token refreshed successfully."));
});
 
const handleLogout = asyncHandler(async (req,res,next)=>{
    //remove the refreshToken from redis for this id.
    const refreshToken = req.cookies.refresh_token;
    if(refreshToken){
        const decodedInfo = await decryptJWT(refreshToken, cleanedEnv.REFRESH_TOKEN_SECRET);
        await redisClient.del(decodedInfo?.id || "SOME_INVALID_KEY");
    }
    res.clearCookie("access_token").clearCookie("refresh_token").json(new ApiResponse(200, null, "Logged out successfully."));
});

const handleForgotPassword=asyncHandler(async(req,res)=>{
    const email=req.body.email;
    if(!email){
          throw new ApiError(422,null, "Email is required." );
    }
    const currentUserData=await User.findOne({email:email});
    console.log("curr :"+currentUserData)
    if(!currentUserData){
        throw new ApiError(422,null, "Email is Not valid" );
    }
   if(currentUserData.status!='active'){
       throw new ApiError(422,null, "Your account is inactive or blocked" );
   }
   const code = Math.floor(100000 + Math.random() * 900000);
    const fetchPromise = await fetch(cleanedEnv.EMAIL_API,{
          method: "POST",
          headers: {
                "Content-Type": "application/json"
          },
          body: JSON.stringify({
                "type": "forgot-password",
                "email": email,
                "code": code
          })
    });
    const emailResponse = await fetchPromise.json(); 
    console.log(email+" "+code);
    
    redisClient.set(email, code, {'EX': 60 * 15}); // 15 minutes in seconds
    if(emailResponse.success){
          res.status(200).json(new ApiResponse(200,null,emailResponse.message))
    }else{
        redisClient.del(email);        
        throw new ApiError(500,emailResponse.error,emailResponse.message);
    }    
});
const handleResetPassword=asyncHandler(async(req,res)=>{
    const {encrypted_email,encrypted_code,new_password}=req.body;
    if(!encrypted_email || !encrypted_code || !new_password){
          throw new ApiError(422,null,"Email, code and password are required.");
    }
    const decryptedEmail = decryptData(encrypted_email);
    const decryptedCode = decryptData(encrypted_code);
    
    const storedCode = await redisClient.get(decryptedEmail);
    if(!storedCode || (storedCode!=decryptedCode)){
          throw new ApiError(400,null,"Link is invalid or expired.");
    }
    const user = await User.findOne({email:decryptedEmail});
    if(!user){
          throw new ApiError(400,null,"Link is invalid or expired.");
    }
    user.password = new_password;
    await user.save();
    redisClient.del(decryptedEmail);
    res.status(200).json(new ApiResponse(200,null,"Password reset successfully."))
});

const handleVerifyEmail=asyncHandler(async(req,res)=>{
    const id=req.params.id;
    if(!id){
          throw new ApiError(422,null,"Invalid verification link.");
    }
    const email = decryptData(id);
    const user = await User.findOne({email});
    if(!user){
          throw new ApiError(400,null,"Invalid email.");
    }
    if(user.status=="inactive"){
        user.status = "active";
        await user.save();
        return res.status(200).json(new ApiResponse(200,null,"Email verified successfully."));
    }
    throw new ApiError(400,null,"Email is already verified.");

})


module.exports={handleLogin,handleLogout,handleRefreshAccessToken,handleForgotPassword,handleResetPassword,handleVerifyEmail}
