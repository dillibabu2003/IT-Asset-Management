class ApiError extends Error{
    statusCode;
    errors;
    constructor(statusCode,errors,message,stack=null){
        super(message);
        this.statusCode=statusCode;
        this.errors=errors;
        this.stack=stack;
    }
}
module.exports=ApiError;