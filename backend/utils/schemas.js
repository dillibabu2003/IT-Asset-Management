const zod=require('zod');
const { statusEnum, genderEnum,passwordRegex,UrlRegex} = require('./constants');



const envSchema=zod.object({
    PORT: zod.string({message:"Port is required and should be a number"}),
    MONGO_URI: zod.string({message:"MONGO_URI is required"}),
    DB_NAME: zod.string({message: "DB name is required"}),
    ACCESS_TOKEN_SECRET: zod.string({message: "Access token is required."}),
    REFRESH_TOKEN_SECRET: zod.string({message: "Refresh token is required."}),
    REDIS_URI: zod.string({message: "REDIS_URI is required."}),
    S3_BUCKET_NAME:zod.string({message:"Image Url is required"}),
    S3_REGION: zod.string({message:"S3 region is required"}),
    AWS_SECRET_KEY: zod.string({message:"AWS secret key is required"}),
    AWS_ACCESS_KEY: zod.string({message:"AWS access key is required"}),
    EMAIL_API: zod.string({message: "Email Api is required."})
});

const loginSchema = zod.object({
    email: zod.string({message: "Email is required."}).email({message: "Email is not valid."}),
    password: zod.string({message: "Password is required."})
})

const userSchema=zod.object({
    user_id: zod.string({message:"User Id is required."}),
    role: zod.string({message:"Role is required"}),
    firstname: zod.string({message:"First name is required"})
               .min(2,{message:"First name should be at least two characters"})
               .max(30,{message:"First name should not exceed 30 characters"}),
    lastname: zod.string({message:"Last name is required"})
               .min(2,{message:"Last name should be at least two characters"})
               .max(30,{message:"Last name should not exceed 30 characters"}),
    email: zod.string({message:"Email is required"}).email({message:"Email is not valid."}),
    password: zod.string({message:"Password is required"})
                .regex(passwordRegex, {message: 'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character'}),
    date_of_birth: zod.string({message:"Date of Birth is required"})
                    .date({message:"Date is not valid"}),
    // status: zod.enum(statusEnum,{message:"Status is not valid"}),
    gender: zod.enum(genderEnum,{message:"Gender is not valid"})
})

module.exports={envSchema, loginSchema,userSchema};