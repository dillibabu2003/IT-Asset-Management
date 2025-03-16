const ApiError = require("../utils/ApiError");
const jwt=require("jsonwebtoken");
const cleanedEnv=require("../utils/cleanedEnv");
const asyncHandler = require("../utils/asyncHandler");
const redisClient = require("../config/redis");

const authMiddleware=asyncHandler(async(req,res,next)=>{
       const token=req.cookies?.access_token;
       if(!token){
          throw new ApiError(401,null,"Invalid token");
       }
       const decodedToken=await jwt.verify(token,cleanedEnv.ACCESS_TOKEN_SECRET);
       const redisToken=await redisClient.get("ACCESS_TOKEN_"+decodedToken.id);
       if(!redisToken){
           throw new ApiError(401,null,"Invalid token");
         }
       req.user=decodedToken;
       next();
})
module.exports=authMiddleware;