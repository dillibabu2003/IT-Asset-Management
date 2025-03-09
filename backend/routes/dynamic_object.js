const express = require('express');
const authorizeClient = require('../middlewares/authorizeClient');
const dynamicObjectRouter = express.Router();
const {getPaginatedDataByObjectId,getUserColumnVisibilitiesByObjectId,createBulkDocumentsOfObjectId, createDocumentOfObjectId,getDataBySearchTermOfObjectId, getAllDataByFilterOfObjectId } = require('../controllers/dynamic_object');

dynamicObjectRouter.get("/:objectId",(req,res,next)=>{ authorizeClient([`view:${req.params.objectId}`])(req,res,next)},getPaginatedDataByObjectId);
dynamicObjectRouter.get('/:objectId/column-visibilities',(req,res,next)=>{authorizeClient([`view:${req.params.objectId}`])(req,res,next)},getUserColumnVisibilitiesByObjectId);
dynamicObjectRouter.post("/:objectId/bulk",(req,res,next)=>{authorizeClient([`create:${req.params.objectId}`])(req,res,next)},createBulkDocumentsOfObjectId);
dynamicObjectRouter.post("/:objectId/create",(req,res,next)=>{authorizeClient([`create:${req.params.objectId}`])(req,res,next)},createDocumentOfObjectId);
dynamicObjectRouter.post("/:objectId/search",(req,res,next)=>{authorizeClient([`view:${req.params.objectId}`])(req,res,next)},getDataBySearchTermOfObjectId);
dynamicObjectRouter.post("/:objectId/filter-docs/all",(req,res,next)=>{authorizeClient([`view:${req.params.objectId}`])(req,res,next)},getAllDataByFilterOfObjectId);
module.exports = dynamicObjectRouter;