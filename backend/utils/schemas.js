const zod=require('zod');

const envSchema=zod.object({
    PORT: zod.string({message:"Port is required and should be a number"}),
    MONGO_URI: zod.string({message:"MONGO_URI is required"}),
    DB_NAME: zod.string({message: "DB name is required"})
});

const loginSchema = zod.object({
    email: zod.string({message: "Email is required."}).email({message: "Email is not valid."}),
    password: zod.string({message: "Password is required."})
})
module.exports={envSchema, loginSchema};