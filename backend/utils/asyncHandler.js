const { ZodError } =require('zod');
const ApiError =require('./ApiError');
const { extractZodErrorMessages } =require('./helperFunctions');
const { JsonWebTokenError } = require('jsonwebtoken');

function asyncHandler(requestHandler) {
	return async (req, res, next) => {
		try {
			await requestHandler(req, res, next);
		} catch (error) {
			console.log(error);
			if (error instanceof ZodError) {
				const errorMessages = extractZodErrorMessages(error);
				res.status(422).json(new ApiError(422, errorMessages, "Invalid params.", error.stack));
			} else if (error instanceof ApiError) {
				res.status(error.statusCode).json(error);
			}else if(error instanceof JsonWebTokenError){
				res.status(401).json(new ApiError(401,{error: "Invalid token"},"Invalid token",error.stack));
			}
			 else {
				
				next(error);
			}
		}
	};
}
module.exports=asyncHandler;