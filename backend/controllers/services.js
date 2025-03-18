const asyncHandler = require("../utils/asyncHandler");
const fs = require("fs");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const cleanedEnv = require("../utils/cleanedEnv");
const { getFileTypeFromContentType } = require("../utils/helperFunctions");
const {
  createPutObjectPreSignedURL,
  createGetObjectPreSignedURL,
} = require("../services/s3");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = new S3Client({
  credentials: {
    accessKeyId: cleanedEnv.AWS_ACCESS_KEY,
    secretAccessKey: cleanedEnv.AWS_SECRET_KEY,
  },
  region: cleanedEnv.S3_REGION,
});
const uploadFileToS3 = async (filePath, bucketName, key) => {
  try {
    const fileStream = fs.createReadStream(filePath);
    const input = {
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
    };
    const uploadResponse = await s3Client.send(new PutObjectCommand(input));
    return { s3Response: uploadResponse, error: null };
  } catch (err) {
    console.error("Error uploading file to S3:", err);
    return { s3Response: null, error: err };
  }
};
const generatePutObjectUrl = asyncHandler(async (req, res) => {
  const { type, content_type, file_name } = req.body;
  if (!type || !content_type || !file_name) {
    throw new ApiError(
      400,
      null,
      "Type of file i.e. profile-pic or invoice, file name and content type are required",
    );
  }
  const fileExtension = getFileTypeFromContentType(content_type);
  if (fileExtension == "unknown") {
    throw new ApiError(400, null, "Invalid content type provided");
  }
  if (type == "invoice") {
    const key = `${cleanedEnv.S3_INVOICES_FOLDER}/${file_name}.${fileExtension}`;
    const response = await createPutObjectPreSignedURL(
      cleanedEnv.S3_BUCKET_NAME,
      key,
      content_type,
    );
    if (response.error) {
      throw new ApiError(500, null, response.error);
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { file_name: key, url: response.s3Response },
          "PutObject Pre-signed URL generated successfully",
        ),
      );
  }
  res.status(400).json(new ApiResponse(400, null, "Invalid type provided"));
});
const generateGetObjectUrl = asyncHandler(async (req, res) => {
  const { key } = req.query;
  if (!key) {
    throw new ApiError(400, null, "Key is required");
  }
  const response = await createGetObjectPreSignedURL(
    cleanedEnv.S3_BUCKET_NAME,
    cleanedEnv.S3_INVOICES_FOLDER + "/" + key,
  );
  if (response.error) {
    throw new ApiError(500, null, response.error);
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { url: response.s3Response },
        "GetObject Pre-signed URL generated successfully",
      ),
    );
});

module.exports = {
  generateGetObjectUrl,
  generatePutObjectUrl,
  uploadFileToS3,
};
