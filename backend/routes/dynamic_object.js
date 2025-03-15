const express = require('express');
const authorizeClient = require('../middlewares/authorizeClient');
const dynamicObjectRouter = express.Router();

const { getPaginatedDataByObjectName, getUserColumnVisibilitiesByObjectName, createBulkDocumentsOfObjectName, createDocumentOfObjectName, getDataBySearchTermOfObjectName, getAllDataByFilterOfObjectName, updateDocumentOfObjectName, deleteDocumentOfObjectName, deleteBulkDocumentsOfObjectName } = require('../controllers/dynamic_object');

dynamicObjectRouter.get("/:objectName", (req, res, next) => { authorizeClient([`view:${req.params.objectName}`])(req, res, next) }, getPaginatedDataByObjectName);
dynamicObjectRouter.get('/:objectName/column-visibilities', (req, res, next) => { authorizeClient([`view:${req.params.objectName}`])(req, res, next) }, getUserColumnVisibilitiesByObjectName);
dynamicObjectRouter.post("/:objectName/bulk", (req, res, next) => { authorizeClient([`create:${req.params.objectName}`])(req, res, next) }, createBulkDocumentsOfObjectName);
dynamicObjectRouter.post("/:objectName/create", (req, res, next) => { authorizeClient([`create:${req.params.objectName}`])(req, res, next) }, createDocumentOfObjectName);
dynamicObjectRouter.put("/:objectName/update", (req, res, next) => { authorizeClient([`edit:${req.params.objectName}`])(req, res, next) }, updateDocumentOfObjectName);
dynamicObjectRouter.delete("/:objectName/delete", (req, res, next) => { authorizeClient([`delete:${req.params.objectName}`])(req, res, next) }, deleteDocumentOfObjectName);
dynamicObjectRouter.delete("/:objectName/delete/bulk", (req, res, next) => { authorizeClient([`delete:${req.params.objectName}`])(req, res, next) }, deleteBulkDocumentsOfObjectName);

dynamicObjectRouter.post("/:objectName/search", (req, res, next) => { authorizeClient([`view:${req.params.objectName}`])(req, res, next) }, getDataBySearchTermOfObjectName);
dynamicObjectRouter.post("/:objectName/filter-docs/all", (req, res, next) => { authorizeClient([`view:${req.params.objectName}`])(req, res, next) }, getAllDataByFilterOfObjectName);
module.exports = dynamicObjectRouter;