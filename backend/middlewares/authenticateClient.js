const ApiError = require("../utils/ApiError");
const jwt=require("jsonwebtoken");
const cleanedEnv=require("../utils/cleanedEnv");
const {fullAccess}=require("../utils/constants")

const authMiddleware=async(req,res,next)=>{
    try{
       const token=req?.cookies?.access_token;
       console.log(req.body);
       if(!token){
          res.status(422).json(new ApiError(422,null,"Invalid token"));
          return;
       }
       const decodedToken=await jwt.verify(token,cleanedEnv.ACCESS_TOKEN_SECRET);
       req.user=decodedToken;
       next();
    }catch(err){
        console.error(err);
        if(err instanceof jwt.JsonWebTokenError){
            res.status(401).json(new ApiError(401,err,"Invalid token")); 
            return ;
        }
        res.status(400).json(new ApiError(400,err,"Unknown error"));
    }
}
module.exports=authMiddleware;