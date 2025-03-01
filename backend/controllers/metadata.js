const Metadata=require('../models/metadata');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {metadataSchema}=require('../utils/schemas');

const getMetaData=asyncHandler(async(req,res)=>{
    const metaDataType=req.params.belongs_to;
    const data=await Metadata.find({belongs_to:metaDataType}).select("-_id -__v -belongs_to");
    if(!data){
        return res.status(404).json(new ApiError(404,null,"MetaData is doen't exist"));
    }
    res.status(200).json(new ApiResponse(200,data,"MetaData fetched successfully"));
});
// add metadata when the user creates custom fields implement the function here but don't create a route.

module.exports={getMetaData};