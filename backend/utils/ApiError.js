class ApiError extends Error{
    statusCode;
    errors;
    constructor(statusCode,errors,message,stack=null){
        this.statusCode=statusCode;
        this.message=message;
        this.stack=stack;
        this.errors=errors;
    }
}
module.exports=ApiError;