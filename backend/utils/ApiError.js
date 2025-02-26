class ApiError extends Error{
    statusCode;
    errors;
    message;
    constructor(statusCode,errors,message,stack=null){
        super(message);
        this.statusCode=statusCode;
        this.errors=errors;
        this.stack=stack;
        this.message=message;
    }
}
module.exports=ApiError;