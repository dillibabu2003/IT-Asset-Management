const express = require('express');
const authorizeClient = require('../middlewares/authorizeClient');
const dynamicObjectRouter = express.Router();

const {getPaginatedDataByObjectName,getUserColumnVisibilitiesByObjectName,createBulkDocumentsOfObjectName, createDocumentOfObjectName,getDataBySearchTermOfObjectName, getAllDataByFilterOfObjectName } = require('../controllers/dynamic_object');

dynamicObjectRouter.get("/:objectName",(req,res,next)=>{ authorizeClient([`view:${req.params.objectName}`])(req,res,next)},getPaginatedDataByObjectName);
dynamicObjectRouter.get('/:objectName/column-visibilities',(req,res,next)=>{authorizeClient([`view:${req.params.objectName}`])(req,res,next)},getUserColumnVisibilitiesByObjectName);
dynamicObjectRouter.post("/:objectName/bulk",(req,res,next)=>{authorizeClient([`create:${req.params.objectName}`])(req,res,next)},createBulkDocumentsOfObjectName);
dynamicObjectRouter.post("/:objectName/create",(req,res,next)=>{authorizeClient([`create:${req.params.objectName}`])(req,res,next)},createDocumentOfObjectName);
dynamicObjectRouter.post("/:objectName/search",(req,res,next)=>{authorizeClient([`view:${req.params.objectName}`])(req,res,next)},getDataBySearchTermOfObjectName);
dynamicObjectRouter.post("/:objectName/filter-docs/all",(req,res,next)=>{authorizeClient([`view:${req.params.objectName}`])(req,res,next)},getAllDataByFilterOfObjectName);
module.exports = dynamicObjectRouter;