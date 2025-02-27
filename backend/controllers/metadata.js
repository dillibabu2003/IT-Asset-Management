const Metadata=require('../models/metadata');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {metadataSchema}=require('../utils/schemas');

const getMetaData=asyncHandler(async(req,res)=>{
    const metaDataType=req.body.belongs_to;
    const data=await Metadata.findOne({belongs_to:metaDataType});
    if(!data){
        return res.status(404).json(new ApiError(404,null,"MetaData is doen't exist"));
    }
    res.status(200).json(new ApiResponse(200,data,"MetaData fetched successfully"));
});
const addMetaData=asyncHandler(async(req,res)=>{
    const data=metadataSchema.parse(req.body);
    const metadata=new Metadata(data);
    await metadata.save();
    if(metadata){
     res.status(201).json(new ApiResponse(201,{user},"MetaData added successfully"));
    }else{
      res.status(500).json(new ApiError(500,null,"Error creating MetaData"));
    }
});

module.exports={getMetaData,addMetaData};