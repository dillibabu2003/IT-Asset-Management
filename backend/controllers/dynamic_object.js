const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const Asset = require("../models/asset");
const Invoice = require("../models/invoice");
const License = require("../models/license");
const Employee = require("../models/employee");

const Checkout = require("../models/checkout");
const MetaData=require("../models/metadata");
const UserColumnVisibilities = require("../models/userPreference");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

//utility functions
function getModelByObjectName(objectName) {
    switch (objectName) {
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

const fetchPaginatedDocumentsByFilter = async (objectName, filter, limit, skip) => {
    const model = getModelByObjectName(objectName);
    if (!model) {
        throw new ApiError(400, null, "Invalid object name");
    }
    if (limit < 0 || skip < 0) {
        throw new ApiError(400, null, "Invalid limit or skip value");
    }

    const documents = await model.find(filter).skip(skip).limit(limit).exec();
    return documents;
}

async function fetchPaginatedDocumentsByObjectName(objectName, page, limit, skip) {
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
                as: "invoice_info"
            }
        },
        {
            $lookup: {
                from: "employees",
                localField: "assigned_to",
                foreignField: "_id",
                as: "employee_info"
            }
        },
        {
            $addFields: {

                invoice_id: { $first: "$invoice_info.invoice_id" },
                date_of_received: {
                    $dateToString: {
                        date: { $first: "$invoice_info.date_of_received" },
                        format: "%d/%m/%Y"
                    }
                },
                name_of_the_vendor: { $first: "$invoice_info.name_of_the_vendor" },
                employee_name: {
                    $concat: [
                        { $first: "$employee_info.firstname" },
                        " ",
                        { $first: "$employee_info.lastname" }
                    ]
                },
                employee_email: { $first: "$employee_info.email" },
                assigned_to: { $first: "$employee_info.employee_id" },
            }
        },
        {
            $project: {
                invoice_info: 0,
                employee_info: 0
            }
        }
    ]
    switch (objectName) {
        case "assets":
            return Asset.aggregate(aggregateQuery).exec();
        case "licenses":
            return License.aggregate(aggregateQuery).exec();
        default:
            return null;
    }
}
async function fetchPaginatedDocumentsWithFiltersByObjectName(objectName, page, limit, skip,filters) {
    const aggregateQuery = [
        {
            $match: filters
        },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: "invoices",
                            localField: "invoice_id",
                            foreignField: "_id",
                            as: "invoice_info"
                        }
                    },
                    {
                        $lookup: {
                            from: "employees",
                            localField: "assigned_to",
                            foreignField: "_id",
                            as: "employee_info"
                        }
                    },
                    {
                        $addFields: {
                            invoice_id: { $first: "$invoice_info.invoice_id" },
                            date_of_received: {
                                $dateToString: {
                                    date: { $first: "$invoice_info.date_of_received" },
                                    format: "%d/%m/%Y"
                                }
                            },
                            name_of_the_vendor: { $first: "$invoice_info.name_of_the_vendor" },
                            employee_name: {
                                $concat: [
                                    { $first: "$employee_info.firstname" },
                                    " ",
                                    { $first: "$employee_info.lastname" }
                                ]
                            },
                            employee_email: { $first: "$employee_info.email" },
                            assigned_to: { $first: "$employee_info.employee_id" },
                        }
                    },
                    {
                        $project: {
                            invoice_info: 0,
                            employee_info: 0
                        }
                    }
                ]
            }
        }
    ]
    switch (objectName) {
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


const fetchAllDocumentsByFilter = async (objectName, filter) => {
    const model = getModelByObjectName(objectName);
    if (!model) {
        throw new ApiError(400, null, "Invalid object name");
    }
    const documents = await model.find(filter).exec();
    return documents;
}

//Validation functions
async function validateFieldType(field, value, fieldSchema) {
    const type = fieldSchema.type?.name?.toLowerCase() || typeof fieldSchema;
    switch (type) {
        case 'string':
            if (typeof value !== 'string') throw new ApiError(400, null, `${field} must be a string`);
            break;
        case 'number':
            if (typeof value !== 'number') throw new ApiError(400, null, `${field} must be a number`);
            break;
        case 'date':
            if (!(value instanceof Date) && isNaN(Date.parse(value)))
                throw new ApiError(400, null, `${field} must be a valid date`);
            break;
        case 'boolean':
            if (typeof value !== 'boolean') throw new ApiError(400, null, `${field} must be a boolean`);
            break;
        case 'objectid':
            if (fieldSchema.required) {
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
        throw new ApiError(400, null, `Invalid ${field}. Must be one of: ${fieldSchema.enum.join(', ')}`);
    }
}

// Validate required fields
function validateRequired(field, value, fieldSchema) {
    if (fieldSchema.required && (value === null || value === undefined)) {
        throw new ApiError(400, null, `${field} is required`);
    }
}

// Validate checkout status for assets and licenses
async function validateStatus(document, objectName) {
    const isAsset = objectName === 'assets';
    const isLicense = objectName === 'licenses';

    if (!isAsset && !isLicense) return;

    const status = document.status;

    if (isAsset && status !== "available") {
        throw new ApiError(400, null, 'Asset status should be available.');
    }

    if (isLicense && status !== 'available') {
        throw new ApiError(400, null, 'Status must be available.');
    }
}

// Validate a single document
async function validateSingleDocument(document, schema, objectName, operationType, columnMetadataUnStructured) {
    // Validate each field in the document
    const columnMetadataStructured = {};
    // console.log(columnMetadataUnStructured);
    columnMetadataUnStructured.forEach((item) => {
      columnMetadataStructured[item.id] = item;
    });
    console.log(document);
    for (const [field, value] of Object.entries(document)) {
        const fieldSchema = schema[field];
        if (!fieldSchema) {
            throw new ApiError(400, null, `Invalid field: ${field}`);
        }
        //Instead of throwing error, we can delete the field
        // console.log(field ," ",columnMetadataStructured[field].create);
        if (operationType == "create" && columnMetadataStructured[field].create == false) {
            delete document[field];
            continue;
        }
        else if (operationType == "update" && columnMetadataStructured[field].edit == false) {
            delete document[field];
            continue;
        }
        validateRequired(field, value, fieldSchema);
        await validateFieldType(field, value, fieldSchema);
        validateEnum(field, value, fieldSchema);
    }
    console.log("Validation done");
    return document;
}

// Main validation function
async function validateDocuments(objectName, documents, operationType) {
    const model = getModelByObjectName(objectName);
    console.log(model);
    if (!model) {
        throw new ApiError(400, null, "Invalid object name");
    }

    const schema = model.schema.obj;
    const columnMetadata = await MetaData.find({ belongs_to: objectName}).select("-_id -__v -belongs_to");
    if (!columnMetadata) {
        throw new ApiError(400, null, "Column metadata not found");
    }
    for (const index in documents) {
        documents[index]=await validateSingleDocument(documents[index], schema, objectName,operationType,columnMetadata);
    }
    return documents;
}

//Controller functions
const getPaginatedDataByObjectName = asyncHandler(async (req, res) => {
    const objectName = req.params.objectName;
    const model = getModelByObjectName(objectName);
    if (!model) {
        throw new ApiError(400, "Invalid object name");
    }
    const { page, limit } = req.query;
    if (!page || !limit) {
        throw new ApiError(400, "Invalid query parameters");
    }
    const parsedPageNumber = parseInt(page);
    const parsedDocumentsLimit = parseInt(limit);
    const skip = (parsedPageNumber - 1) * parsedDocumentsLimit;
    if (isNaN(parsedPageNumber) || isNaN(parsedDocumentsLimit)) {
        throw new ApiError(400, "Invalid query parameters");
    }
    const totalDocuments = await model.countDocuments();
    const objectData = await fetchPaginatedDocumentsByObjectName(objectName, parsedPageNumber, parsedDocumentsLimit, skip);
    res.status(200).json(new ApiResponse(200, { documents: [...objectData], total: totalDocuments }, `${objectName} fetched successfully`));
});
const getPaginatedDataWithFiltersByObjectName = asyncHandler(async (req, res) => {
    const objectName = req.params.objectName;
    const model = getModelByObjectName(objectName);
    if (!model) {
        throw new ApiError(400, "Invalid object name");
    }
    const { page, limit,filters } = req.query;
    if (!page || !limit||!filters) {
        throw new ApiError(400, "Invalid query parameters. Page, limit and filters are required");
    }
    const parsedPageNumber = parseInt(page);
    const parsedDocumentsLimit = parseInt(limit);
    const skip = (parsedPageNumber - 1) * parsedDocumentsLimit;
    if (isNaN(parsedPageNumber) || isNaN(parsedDocumentsLimit)) {
        throw new ApiError(400, "Invalid query parameters");
    }
    const objectData = await fetchPaginatedDocumentsWithFiltersByObjectName(objectName, parsedPageNumber, parsedDocumentsLimit, skip,JSON.parse(filters));
    res.status(200).json(new ApiResponse(200, { documents: [...objectData[0].data], total: objectData[0].metadata[0]?.total!=undefined ? objectData[0].metadata[0]?.total: 0 }, `${objectName} fetched successfully`));
});

const getUserColumnVisibilitiesByObjectName = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const objectName = req.params.objectName;
    if (!objectName) {
        throw new ApiError(400, null, "Invalid object name");
    }
    const allColumnVisibilites = await UserColumnVisibilities.findOne({ user_id: userId });
    if (!allColumnVisibilites) {
        throw new ApiError(400, null, "User preferences not found");
    }
    const currentObjectNamePreferences = allColumnVisibilites.visible_fields.get(objectName);
    if (!currentObjectNamePreferences) {
        throw new ApiError(400, null, "Invalid object name");
    }
    res.status(200).json(new ApiResponse(200, currentObjectNamePreferences, `${objectName} Column preferences fetched successfully.`));
});

const createBulkDocumentsOfObjectName = asyncHandler(async (req, res) => {
    const objectName = req.params.objectName;
    const model = getModelByObjectName(objectName);
    console.log("Request Body",req.body);
    const documents = req.body;
    if (!model) {
        throw new ApiError(400, null, "Invalid object name");
    }
    
    if (!documents) {
        throw new ApiError(400, null, "Invalid request body");
    }
    if (objectName === 'assets' || objectName === 'licenses') {
        for (let i = 0; i < documents.length; i++) {
            const invoice = await Invoice.findOne({ invoice_id: documents[i].invoice_id });
            if (!invoice) {
                throw new ApiError(400, null, "Invalid invoice id");
            }
            documents[i].invoice_id = invoice._id;
        }
    }
    await validateDocuments(objectName, documents,"create");

    const createdDocuments = await model.insertMany(documents);
    res.status(200).json(new ApiResponse(200, createdDocuments, `${objectName} created successfully`));
});

const createDocumentOfObjectName = asyncHandler(async (req, res,next) => {
    const objectName = req.params.objectName;
    const model = getModelByObjectName(objectName);
    if (!model) {
        throw new ApiError(400, null, "Invalid object name");
    }
    const document = req.body;
    if (!document) {
        throw new ApiError(400, null, "Invalid request body");
    }
    if (objectName === 'assets' || objectName === 'licenses') {
        const invoice = await Invoice.findOne({ invoice_id: document.invoice_id });
        if (!invoice) {
            throw new ApiError(400, null, "Invalid invoice id");
        }
        document.invoice_id = invoice._id;
    }
    const updatedDocuments=await validateDocuments(objectName, [document],"create");
    const createdDocument = await model.create(updatedDocuments[0]);
    res.status(200).json(new ApiResponse(200, createdDocument, `${objectName} created successfully`));
});

const getDataBySearchTermOfObjectName = asyncHandler(async (req, res) => {
    const objectName = req.params.objectName;
    console.log(req.body);

    const { searchKey, category, status } = req.body;
    if (searchKey == undefined || !category || !status) {
        throw new ApiError(400, null, "Invalid search term or category or status");
    }
    //check for the category as well
    const model = getModelByObjectName(objectName);
    if (!model) {
        throw new ApiError(400, null, "Invalid object name");
    }
    if (searchKey.trim().length === 0) {
        const firstTenDocuments = await fetchPaginatedDocumentsByFilter(objectName, { status }, 10, 0); //add category filter here after updating db and seeding
        res.status(200).json(new ApiResponse(200, firstTenDocuments, `${objectName} fetched successfully`));
        return;
    }
    const objectData = await model.aggregate([
        {
            $search: {
                index: "AssetIndex",
                text: {
                    query: searchKey,
                    path: ["asset_id", "make", "model", "ram", "storage", "processor", "os_type"],
                    fuzzy: {
                        prefixLength: 2,
                        maxEdits: 2,
                    }
                }
            }
        }
    ]);
    const totalDocuments = objectData.length;
    if (totalDocuments === 0) {
        throw new ApiError(404, null, "No documents found");
    }
    res.status(200).json(new ApiResponse(200, objectData, `${objectName} fetched successfully`));
});

const getAllDataByFilterOfObjectName = asyncHandler(async (req, res) => {
    const objectName = req.params.objectName;
    const filter = req.body;
    if (!filter) {
        throw new ApiError(400, null, "Invalid filter");
    }
    delete filter?.object_name
    console.log(filter);

    const objectData = await fetchAllDocumentsByFilter(objectName, filter);
    res.status(200).json(new ApiResponse(200, objectData, `${objectName} fetched successfully`));
});

const updateDocumentOfObjectName = asyncHandler(async (req, res) => {
    const objectName = req.params.objectName;
    const {serial_no}=req.body;
    const model = getModelByObjectName(objectName);
    if (!model) {
        throw new ApiError(400, null, "Invalid object name");
    }
    const document=req.body;
    if (!document) {
        throw new ApiError(400, null, "Invalid request body");
    }
    const cleanedDocument = await validateDocuments(objectName,[document],"update");
    console.log(serial_no);
    const originalDocument = await model.findOne({ serial_no:serial_no});
    if (!originalDocument) {
        throw new ApiError(404, null, "Document not found");
    }
    const updatedDocument = await model.findOneAndUpdate({serial_no:serial_no}, cleanedDocument[0], {new:true});
    if (!updatedDocument) {
        throw new ApiError(404, null, "Document not found");
    }
    res.status(200).json(new ApiResponse(200, updatedDocument, `${objectName} updated successfully`));
});

const deleteDocumentOfObjectName = asyncHandler(async (req, res) => {
    const objectName = req.params.objectName;
    const {serial_no,object_name}=req.body;
    const model = getModelByObjectName(object_name);
    console.log(req.body);
    if (!model) {
        throw new ApiError(400, null, "Invalid object name");
    }
    
    if (!serial_no) {
        throw new ApiError(400, null, "Invalid request body");
    }
    const document=await model.findOne({serial_no:serial_no});
    if(document.assigned_to!==null){
        throw new ApiError(400,null,`Cannot delete assigned ${object_name}`);
    }
    const deletedDocument = await model.findOneAndDelete({serial_no:serial_no});
    if (!deletedDocument) {
        throw new ApiError(404, null, "Document not found");
    }
    res.status(200).json(new ApiResponse(200, deletedDocument, `${objectName} deleted successfully`));
});

const deleteBulkDocumentsOfObjectName = asyncHandler(async (req, res) => {
    const objectName = req.params.objectName;
    const model = getModelByObjectName(objectName);
    const {serial_nos,object_name}=req.body;
    if (!model) {
        throw new ApiError(400, null, "Invalid object name");
    }
    if(!serial_nos || serial_nos.length==0){
        throw new ApiError(400,null,"Invalid request body");
    }
    const documents = await model.find({ serial_no: { $in: serial_nos }, assigned_to: null });
    // Try to delete the history of the assets as well.
    if(!documents){
        throw new ApiError(404,null,"Invalid serial numbers found");
    }
    if(serial_nos.length!=documents.length){
        throw new ApiError(400,null,"Invalid serial numbers found or cannot delete assigned assets");
    }
    const deletedDocuments = await model.deleteMany({ _id: { $in: documents } });
    res.status(200).json(new ApiResponse(200, deletedDocuments, `${objectName} deleted successfully`));
});

module.exports = {
    getPaginatedDataByObjectName,
    getUserColumnVisibilitiesByObjectName,
    createBulkDocumentsOfObjectName,
    createDocumentOfObjectName,
    getDataBySearchTermOfObjectName,
    getAllDataByFilterOfObjectName,
    getPaginatedDataWithFiltersByObjectName,
    getModelByObjectName,
    updateDocumentOfObjectName,
    deleteDocumentOfObjectName,
    deleteBulkDocumentsOfObjectName
};
