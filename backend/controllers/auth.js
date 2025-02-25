const jwt = require('jsonwebtoken');
 
const asyncHandler = require('../utils/asyncHandler');
const {loginSchema} = require('../utils/schemas');
const User = require('../models/user');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const cleanedEnv = require('../utils/cleanedEnv');
const redisClient = require('../config/redis');
const { decryptJWT } = require('../utils/helperFunctions');
 
async function generateAccessTokenAndRefreshToken(user){
    const accessToken = await jwt.sign({id: user.user_id,email: user.email,role: user.role},cleanedEnv.ACCESS_TOKEN_SECRET,{expiresIn: '1h'});
    const refreshToken = await jwt.sign({id: user.user_id,email: user.email,role: user.role},cleanedEnv.REFRESH_TOKEN_SECRET,{expiresIn: '2h'});
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
    delete user.password;
    const [accessToken,refreshToken] = await generateAccessTokenAndRefreshToken(user);
    const cookieOptions = {
        httpOnly: true,
        secure: false, //When deployed and assigned a domain with valid ssl/tls certificate make it to true.
        overwrite: true
    }
    res
    .status(200)
    .cookie("access_token",accessToken,cookieOptions)
    .cookie("refresh_token",refreshToken,cookieOptions)
    .json(new ApiResponse(200,user,"Logged in successfully."));
});
 
const handleRefreshAccessToken = asyncHandler(async (req,res,next)=>{
    const refreshToken = req.cookies.refresh_token;
    const decodedInfo = await decryptJWT(refreshToken,cleanedEnv.REFRESH_TOKEN_SECRET);
    const storedRedisRefreshToken = await redisClient.get(decodedInfo?.id||"SOME_INVALID_KEY");
    if(!refreshToken || !storedRedisRefreshToken || refreshToken!=storedRedisRefreshToken){
        throw new ApiError(401,{error: "Invalid refresh token"},"Invalid refresh token",null);
    }
    const [newAccessToken,newRefreshToken] = await generateAccessTokenAndRefreshToken({user_id: decodedInfo.id, email: decodedInfo.email, role: decodedInfo.role});
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
 
 
 
module.exports={handleLogin,handleLogout,handleRefreshAccessToken}