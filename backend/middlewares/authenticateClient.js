const ApiError = require("../utils/ApiError");
const jwt=require("jsonwebtoken");
const cleanedEnv=require("../utils/cleanedEnv");
const {fullAccess}=require("../utils/constants");
const asyncHandler = require("../utils/asyncHandler");

const authMiddleware=asyncHandler(async(req,res,next)=>{
       const token=req.cookies?.access_token;
       if(!token){
          throw new ApiError(401,null,"Invalid token");
       }
       const decodedToken=await jwt.verify(token,cleanedEnv.ACCESS_TOKEN_SECRET);
       req.user=decodedToken;
       next();
})
module.exports=authMiddleware;