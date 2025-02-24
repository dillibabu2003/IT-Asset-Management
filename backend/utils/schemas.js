const zod=require('zod');

const envSchema=zod.object({
    PORT: zod.string({message:"Port is required and should be a number"}),
    MONGO_URI: zod.string({message:"MONGO_URI is required"}),
    DB_NAME: zod.string({message: "DB name is required"})
});
module.exports={envSchema};