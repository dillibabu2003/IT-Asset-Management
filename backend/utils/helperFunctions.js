const jwt = require('jsonwebtoken');
function extractZodErrorMessages(zodError){
    let errorMessages={};
    zodError.issues.map((issue)=>{
        errorMessages[issue.path[0]]=issue.message;
    });
    return errorMessages;
} 
async function decryptJWT(token,secret){
    return await jwt.verify(token,secret);
}
const getFileTypeFromContentType = (contentType) => {
    const mapping = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
    };
    return mapping[contentType] || 'unknown';
};
module.exports={
    extractZodErrorMessages,
    decryptJWT,
    getFileTypeFromContentType
}