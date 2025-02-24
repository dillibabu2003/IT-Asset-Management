function extractZodErrorMessages(zodError){
    let errorMessages={};
    zodError.issues.map((issue)=>{
        errorMessages[issue.path[0]]=issue.message;
    });
    return errorMessages;
} 
module.exports={
    extractZodErrorMessages
}