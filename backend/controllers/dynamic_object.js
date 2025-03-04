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

const getPaginatedDataByObjectId = asyncHandler(async (req, res) => {
    console.log("getPaginatedDataByObjectId");

    const objectId = req.params.objectId;
    const model = getModelByObjectId(objectId);
    if (!model) {
        throw new ApiError(400, "Invalid object id");
    }
    const { page, limit } = req.query;
    const objectData = await model.find()
        .skip((page - 1) * limit)
        .limit(limit);
    console.log(objectData);

    res.status(200).json(new ApiResponse(200, { documents: [...objectData], total: objectData.length }, `${objectId} fetched successfully`));
});
const getUserColumnVisibilitiesByObjectId = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const objectId = req.params.objectId;
    console.log(objectId);
    
    if (!objectId) {
        throw new ApiError(400, null, "Invalid object id");
    }
    const allColumnVisibilites = await UserColumnVisibilities.findOne({ user_id: userId });
    console.log(allColumnVisibilites);
    
    const currentObjectIdPreferences = allColumnVisibilites.visible_fields.get(objectId);
    // console.log(currentObjectIdPreferences);
    
    if (!currentObjectIdPreferences) {
        throw new ApiError(400, null, "Invalid object id");
    }
    res.status(200).json(new ApiResponse(200, currentObjectIdPreferences, `${objectId} Column preferences fetched successfully.`));
});
module.exports = {
    getPaginatedDataByObjectId,
    getUserColumnVisibilitiesByObjectId
};
