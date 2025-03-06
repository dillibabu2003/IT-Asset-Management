const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const Asset = require("../models/asset");
const Invoice = require("../models/invoice");
const License = require("../models/license");
const Employee = require("../models/employee");
const Checkout = require("../models/checkOut");
const UserColumnVisibilities = require("../models/userPreference");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");


//utility functions
function getModelByObjectId(objectId) {
    switch (objectId) {
        case "assets":
            return Asset;
        case "invoices":
            return Invoice;
        case "licenses":
            return License;
        default:
            return null;
    }
}

async function fetchPaginatedDocumentsByObjectId(objectId, page, limit,skip) {
    const aggregateQuery = [
        {
            $skip: skip
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "invoices",
                localField: "invoice_id",
                foreignField: "_id",
                as: "invoice"
            }
        },
        {
            $addFields: {
                invoice_id: {$first: "$invoice.invoice_id"}
            }
        },
        {
            $project: {
                invoice: 0
            }
        }
    ]
    switch (objectId) {
        case "assets":
            return Asset.aggregate(aggregateQuery).exec();
        case "invoices":
            return Invoice.find().skip((page - 1) * limit).limit(limit).exec();
        case "licenses":
            return License.aggregate(aggregateQuery).exec();
        default:
            return null;
    }
}

async function validateFieldType(field, value, fieldSchema) {
    const type = fieldSchema.type?.name?.toLowerCase() || typeof fieldSchema;
    switch (type) {
        case 'string':
            if (typeof value !== 'string') throw new ApiError(400,null, `${field} must be a string`);
            break;
        case 'number':
            if (typeof value !== 'number') throw new ApiError(400,null, `${field} must be a number`);
            break;
        case 'date':
            if (!(value instanceof Date) && isNaN(Date.parse(value))) 
                throw new ApiError(400,null, `${field} must be a valid date`);
            break;
        case 'boolean':
            if (typeof value !== 'boolean') throw new ApiError(400,null, `${field} must be a boolean`);
            break;
        case 'objectid':
            if(fieldSchema.required){
                const refModel = mongoose.model(fieldSchema.ref);
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    throw new ApiError(400, null, `${field} must be a valid id.`);
                }
                // Get the referenced model from the schema
                if (refModel) {
                    const refDoc = await refModel.findOne({ _id: value });
                    if (!refDoc) {
                        throw new ApiError(400, null, `${fieldSchema.ref} with id ${value} does not exist`);
                    }
                }
            }
            break;
    }
}

// Validate enum values
function validateEnum(field, value, fieldSchema) {
    if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
        throw new ApiError(400,null, `Invalid ${field}. Must be one of: ${fieldSchema.enum.join(', ')}`);
    }
}

// Validate required fields
function validateRequired(field, value, fieldSchema) {
    if (fieldSchema.required && (value === null || value === undefined)) {
        throw new ApiError(400,null, `${field} is required`);
    }
}

// Validate checkout status for assets and licenses
async function validateCheckoutForStatus(document, objectId) {
    const isAsset = objectId === 'assets';
    const isLicense = objectId === 'licenses';

    if (!isAsset && !isLicense) return;

    const status = document.status;
    const checkoutId = document.checkout_id;

    if (isAsset && status !== "available") {
        throw new ApiError(400,null, 'Asset status should be available.');
    }
    
    if (isLicense && status !== 'available') {
        if (!checkoutId) {
            throw new ApiError(400,null, 'Status must be available.');
        }
    }
}

// Validate a single document
async function validateSingleDocument(document, schema, objectId) {
    // Validate each field in the document
    for (const [field, value] of Object.entries(document)) {
        const fieldSchema = schema[field];
        if (!fieldSchema) {
            throw new ApiError(400,null, `Invalid field: ${field}`);
        }

        validateRequired(field, value, fieldSchema);
        await validateFieldType(field, value, fieldSchema);
        validateEnum(field, value, fieldSchema);

        if (field === 'status') {
            await validateCheckoutForStatus(document, objectId);
        }
    }

    // Check for missing required fields
    for (const [field, fieldSchema] of Object.entries(schema)) {
        if (fieldSchema.required && !(field in document)) {
            throw new ApiError(400,null, `Missing required field: ${field}`);
        }
    }
}


// Main validation function
async function validateDocuments(objectId, documents) {
    const model = getModelByObjectId(objectId);
    if (!model) {
        throw new ApiError(400,null, "Invalid object id");
    }

    const schema = model.schema.obj;
    
    for (const document of documents) {
        await validateSingleDocument(document, schema, objectId);
    }
}

//Controller functions
const getPaginatedDataByObjectId = asyncHandler(async (req, res) => {
    const objectId = req.params.objectId;
    const model = getModelByObjectId(objectId);
    if (!model) {
        throw new ApiError(400, "Invalid object id");
    }
    const { page, limit } = req.query;
    if(!page || !limit){
        throw new ApiError(400, "Invalid query parameters");
    }
    const parsedPageNumber = parseInt(page);
    const parsedDocumentsLimit = parseInt(limit);
    const skip = (parsedPageNumber - 1) * parsedDocumentsLimit;
    if (isNaN(parsedPageNumber) || isNaN(parsedDocumentsLimit)) {
        throw new ApiError(400, "Invalid query parameters");
    }
    const totalDocuments = await model.countDocuments();
    const objectData = await fetchPaginatedDocumentsByObjectId(objectId, parsedPageNumber, parsedDocumentsLimit,skip);
    res.status(200).json(new ApiResponse(200, { documents: [...objectData], total: totalDocuments }, `${objectId} fetched successfully`));
});


const getUserColumnVisibilitiesByObjectId = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const objectId = req.params.objectId;    
    if (!objectId) {
        throw new ApiError(400, null, "Invalid object id");
    }
    const allColumnVisibilites = await UserColumnVisibilities.findOne({ user_id: userId });    
    const currentObjectIdPreferences = allColumnVisibilites.visible_fields.get(objectId);    
    if (!currentObjectIdPreferences) {
        throw new ApiError(400, null, "Invalid object id");
    }
    res.status(200).json(new ApiResponse(200, currentObjectIdPreferences, `${objectId} Column preferences fetched successfully.`));
});

const createBulkDocumentsOfObjectId = asyncHandler(async (req,res)=>{
    const objectId = req.params.objectId;
    const model = getModelByObjectId(objectId);
    if (!model) {
        throw new ApiError(400,null, "Invalid object id");
    }
    const documents = req.body.documents;
    if(!documents){
        throw new ApiError(400,null, "Invalid request body");
    }
    //comment this line when the invoice id is shown as select field in the frontend as we get the _id directly from there.
    if(objectId==='assets' || objectId==='licenses'){
        for(let i=0;i<documents.length;i++){
            const invoice = await Invoice.findOne({invoice_id:documents[i].invoice_id});
            documents[i].invoice_id = invoice._id;
            documents[i].date_of_received = invoice.date_of_received;
            documents[i].name_of_the_vendor = invoice.name_of_the_vendor;
            documents[i].checkout_id=[]
        }
    }
    await validateDocuments(objectId,documents);

    const createdDocuments = await model.insertMany(documents);
    res.status(200).json(new ApiResponse(200, createdDocuments, `${objectId} created successfully`));
});

const createDocumentOfObjectId = asyncHandler(async (req, res) => {
    const objectId = req.params.objectId;
    const model = getModelByObjectId(objectId);
    if (!model) {
        throw new ApiError(400,null, "Invalid object id");
    }
    const document = req.body;
    if (!document) {
        throw new ApiError(400,null, "Invalid request body");
    }
    if(objectId==='assets' || objectId==='licenses'){
        const invoice = await Invoice.findOne({invoice_id:document.invoice_id});
        if (!invoice) {
            throw new ApiError(400,null, "Invalid invoice id");
        }
        document.invoice_id = invoice._id;
        document.date_of_received = invoice.date_of_received;
        document.name_of_the_vendor = invoice.name_of_the_vendor;
        document.checkout_id=[];
    }
    await validateDocuments(objectId, [document]);
    const createdDocument = await model.create(document);
    res.status(200).json(new ApiResponse(200, createdDocument, `${objectId} created successfully`));
});

module.exports = {
    getPaginatedDataByObjectId,
    getUserColumnVisibilitiesByObjectId,
    createBulkDocumentsOfObjectId,
    createDocumentOfObjectId
};
