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
module.exports={
    extractZodErrorMessages,
    decryptJWT
}