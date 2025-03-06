const asyncHandler = require("../utils/asyncHandler");
const Invoice = require("../models/invoice");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const cleanedEnv = require("../utils/cleanedEnv");
const { getFileTypeFromContentType } = require("../utils/helperFunctions");
const {createPutObjectPreSignedURL, createGetObjectPreSignedURL} = require('../services/s3');

const generatePutObjectUrl = asyncHandler(async (req, res) => {
    const { type, content_type } = req.body;
    if(!type || !content_type){
        throw new ApiError(400,null,"Type of file i.e. profile-pic or invoice is required and content type are required");
    }
    const fileExtension = getFileTypeFromContentType(content_type);
    if(fileExtension=="unknown"){
        throw new ApiError(400,null,"Invalid content type provided");
    }    
    if(type=="invoice"){
        const totalInvoiceCount = await Invoice.find().countDocuments();
        const key = `${cleanedEnv.S3_INVOICES_FOLDER}/INV${totalInvoiceCount + 1}.${fileExtension}`;
        const response = await createPutObjectPreSignedURL(cleanedEnv.S3_BUCKET_NAME, key, content_type);
        if(response.error){
            throw new ApiError(500,null,response.error);
        }
        return res.status(200).json(new ApiResponse(200,{file_name:key, url: response.s3Response},"PutObject Pre-signed URL generated successfully"));
    }
    res.status(400).json(new ApiResponse(400,null,"Invalid type provided"));
});
const generateGetObjectUrl = asyncHandler(async (req, res) => {
    const {  key } = req.body;
    if( !key){
        throw new ApiError(400,null,"Key is required");
    }
    const response = await createGetObjectPreSignedURL(cleanedEnv.S3_BUCKET_NAME, key);
    if(response.error){
        throw new ApiError(500,null,response.error);
    }
    res.status(200).json(new ApiResponse(200,{url: response.s3Response},"GetObject Pre-signed URL generated successfully"));
});

module.exports={
    generateGetObjectUrl,
    generatePutObjectUrl
}