const asyncHandler = require("../utils/asyncHandler");

const Asset = require("../models/asset");
const Invoice = require("../models/invoice");
const License = require("../models/license");
const UserColumnVisibilities = require("../models/userPreference");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

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
module.exports = {
    getPaginatedDataByObjectId,
    getUserColumnVisibilitiesByObjectId
};
