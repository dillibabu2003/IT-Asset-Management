const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const cleanedEnv = require("../utils/cleanedEnv");
const s3Client = new S3Client({
  credentials: {
    accessKeyId: cleanedEnv.AWS_ACCESS_KEY,
    secretAccessKey: cleanedEnv.AWS_SECRET_KEY,
  },
  region: cleanedEnv.S3_REGION,
});

// const uploadFileToS3 = async (filePath, bucketName, key) => {
//     try {
//           const fileStream = fs.createReadStream(filePath);
//           const input = {
//                 Bucket: bucketName,
//                 Key: key,
//                 Body: fileStream,
//           };
//             const uploadResponse = await s3Client.send(new PutObjectCommand(input));
//             return {s3Response: uploadResponse,error: null};
//       } catch (err) {
//             console.error("Error uploading file to S3:", err);
//             return {s3Response: null,error: err};
//       }
// };

const createGetObjectPreSignedURL = async (bucketName, key) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  try {
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    return { s3Response: presignedUrl, error: null };
  } catch (err) {
    console.error("Error getting pre-signed URL:", err);
    return { s3Response: null, error: err };
  }
}; //key -generated invoice name
const createPutObjectPreSignedURL = async (bucketName, key, contentType) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    "Access-Control-Allow-Origin": "*",
  });

  try {
    const presignedUrl = await getSignedUrl(s3Client, command, {
      signableHeaders: new Set(["content-type", "access-control-allow-origin"]),
      expiresIn: 3600,
    });
    return { s3Response: presignedUrl, error: null };
  } catch (err) {
    console.error("Error getting pre-signed URL:", err);
    return { s3Response: null, error: err };
  }
};
const deleteObjectFromS3 = async (bucketName, key) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  try {
    const deleteResponse = await s3Client.send(command);
    return { s3Response: deleteResponse, error: null };
  } catch (err) {
    console.error("Error deleting object from S3:", err);
    return { s3Response: null, error: err };
  }
};
module.exports = {
  // uploadFileToS3,
  createGetObjectPreSignedURL,
  deleteObjectFromS3,
  createPutObjectPreSignedURL,
};
