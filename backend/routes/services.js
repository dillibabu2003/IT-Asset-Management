const { Router } = require("express");
const { generateGetObjectUrl, generatePutObjectUrl } = require("../controllers/services");
const authorizeClient = require('../middlewares/authorizeClient');
const servicesRouter = Router();

servicesRouter.post("/s3/put-object-url",(req,res,next)=>{authorizeClient(["create:invoices"])(req,res,next)} ,generatePutObjectUrl);
servicesRouter.post("/s3/get-object-url",(req,res,next)=>{authorizeClient(["view:invoices"])(req,res,next)},generateGetObjectUrl);

module.exports=servicesRouter;