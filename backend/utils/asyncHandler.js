const { ZodError } = require('zod');
const ApiError = require('./ApiError');

module.exports= async function asyncHandler(requestHandler){
    return async (req,res, next) => {
		try {
			await requestHandler(req, res, next);
		} catch (error) {
			if(error instanceof ZodError){
                const errorMessages = extractZodErrorMessages(error);
                res.status(422).json(new ApiError(422,errorMessages,"Invalid params.",error.stack));
            }
			else if(error instanceof ApiError){
				res.status(error.statusCode).json(error);
			}
		}
	};
}