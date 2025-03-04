const express = require('express');
const authorizeClient = require('../middlewares/authorizeClient');
const dynamicObjectRouter = express.Router();
const {getPaginatedDataByObjectId,getUserColumnVisibilitiesByObjectId } = require('../controllers/dynamic_object');

dynamicObjectRouter.get("/:objectId",(req,res,next)=>{ authorizeClient([`view:${req.params.objectId}`])(req,res,next)},getPaginatedDataByObjectId);
dynamicObjectRouter.get('/:objectId/column-visibilities',(req,res,next)=>{authorizeClient([`view:${req.params.objectId}`])(req,res,next)},getUserColumnVisibilitiesByObjectId);

module.exports = dynamicObjectRouter;