const { envSchema } = require('./schemas');
const {config}=require("dotenv");
config();
const {data,error}=envSchema.safeParse(process.env);
// console.log(data);

if(error){
    console.error(error);
    process.exit(1);
}
module.exports=data;
