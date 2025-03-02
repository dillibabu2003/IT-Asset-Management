const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const Dashboard = require("../models/dashboard");
const Asset = require("../models/asset");
const Invoice = require("../models/invoice");
const License = require("../models/license");
const Archive = require("../models/archive");
const { configureDashboardSchema } = require("../utils/schemas");
const ApiError = require("../utils/ApiError");

const acceptedIds = ["assets","licenses","invoices","archives"];
function validateDashboardId(id){
    return acceptedIds.includes(id);
}
function getMongooseDataModelById(id){
    switch(id){
        case "assets":
            return Asset;
        case "invoices":
            return Invoice;
        case "licenses":
            return License;
        case "archives":
            return Archive;
        default:
            return null;
    }
}
function validateTilesMatcherField(id,field){
    const model = getMongooseDataModelById(id);
    const fieldsOfModel = Object.keys(model.schema.obj);
    return fieldsOfModel.includes(field);
}
async function validateTilesMatcherValue(id, field, value) {
    const model = getMongooseDataModelById(id);
    const schemaField = model.schema.path(field);
    if (!schemaField) {
        return false;
    }
     if (schemaField.instance === 'Date') {
        return value && typeof value === 'object' && value.start && value.end;
    } else if (schemaField.enumValues && schemaField.enumValues.length > 0) {
        return schemaField.enumValues.includes(value);
    } else {
        return value === '';
    }
}
function validateTilesTarget(id, target, func) {
    if (!target) {
        return func !== "sum" && func !== "avg";
    }

    const model = getMongooseDataModelById(id);
    const schemaField = model.schema.path(target);

    if (!schemaField) {
        return false;
    }

    const validTypes = ["Number", "BigInt", "BigInt32"];
    return validTypes.includes(schemaField.instance) && (func === "sum" || func === "avg");
}
function validateElementFields(id, fields, type) {
    const model = getMongooseDataModelById(id);
    const fieldsOfModel = Object.keys(model.schema.obj);
    if (type === "pie" || type === "bar") {
        if (fields.length !== 1) {
            return false;
        }
        const field = fields[0];
        const schemaField = model.schema.path(field);
        return schemaField && schemaField.enumValues && schemaField.enumValues.length > 0;
    }

    return fields.every((field) => fieldsOfModel.includes(field));
}
function validateConfigureDashboardTiles(id, tiles) {
    tiles.forEach((tile) => {
        if (!validateTilesMatcherField(id, tile.matcher_field)){
            return false;
        }
        if (!validateTilesMatcherValue(id, tile.matcher_field, tile.matcher_value)) {
            return false;
        }

        if (!validateTilesTarget(id, tile.target, tile.func)) {
            return false;
        }
    });
    return true;
}

function validateConfigureDashboardElements(id, elements) {
    elements.forEach((element)=>{
        if(!validateElementFields(id,element.fields)){
            return false;
        }
    });
    return true;
}

function constructCountQuery(matcher_field,matcher_value){
    const query = [{
        $match:{
            [matcher_field]: matcher_value
        }},
        {
        $count: "value"
    }];
    return query;
}
function constructCountAllQuery(){
    const query = [{
        $count: "value"
    }];
    return query;
}
function constructSumQuery(matcher_field,matcher_value,target){
    const query = [{
        $match: {
            [matcher_field]: matcher_value
        }},
        {$group: {
            _id: target,
            value: { $sum: `$${target}`}
        }
    }];
    return query;
}
function constructAverageQuery(matcher_field,matcher_value,target){
    const query = [{
        $match: {
            [matcher_field]: matcher_value
        }},
        {$group: {
            _id: target,
            value: { $avg: `$${target}`}
        }
    }];
    return query;
}
function constructTableQuery(fields){
    const queryProjectionObject = {};
    fields.map((field)=>{
        queryProjectionObject[field]=1;
    });
    let query = [{
        $sort: { updatedAt: -1 } 
      },
      {
        $project: queryProjectionObject
      },
      {
        $limit: 6 
      }];
      return query;

}

function getTilesWithQueriesAttached(tiles){
    tiles.forEach(tile => {
        let query;
        if(tile.func == "count"){
            query = tile.matcher_value!="" ? constructCountQuery(tile.matcher_field,tile.matcher_value): constructCountAllQuery();
        }
        else if(tile.func == "sum"){
            query = constructSumQuery(tile.matcher_field,tile.matcher_value,tile.target);
        }
        else{
            query = constructAverageQuery(tile.matcher_field,tile.matcher_value,tile.target);
        }
        tile.query = JSON.stringify(query);
    });
    return tiles;
}

function constructGroupByFieldQuery(field){
    let query = [{
        $group: {
          _id: `$${field}`,
          count: { $sum: 1 }
        }
      }];
      return query;
    
}

function getElementsWithQueriesAttached(elements){
    elements.forEach(element =>{
        let query;
        if(element.type=="table"){
            query = constructTableQuery(element.fields)
        }
        else{
            //find a better name for this function.
            query = constructGroupByFieldQuery(element.fields[0]);
        }
        element.query = JSON.stringify(query);
    });
    return elements;
}
async function executeQueryWithGivenModel(query,model){
    const result = await model.aggregate(JSON.parse(query));
    return result;
}
async function parseRawDashboardData(dashboardData,model){
    const tilePromises =  dashboardData.tiles.map(async (tile)=>{
        const queryResult = await executeQueryWithGivenModel(tile.query,model);
        const value = queryResult[0]?.value || 0;
        const resultValue = tile.func == "avg" ? value.toFixed(2) : value;        
        const parsedTile = {title: tile.title, value: resultValue, icon: tile.icon, color: tile.color};
        return parsedTile;
    });
    const elementPromises = dashboardData.elements.map(async (element)=>{
        const queryResult = await executeQueryWithGivenModel(element.query,model);
        
        const parsedTile = {title: element.title, data: queryResult,fields: element.fields, type: element.type};
        return parsedTile;
    });

    const tiles = await Promise.all(tilePromises);
    const elements = await Promise.all(elementPromises);
    return {id:dashboardData.id, label: dashboardData.label, tiles,elements};
}
const handleGetDashboardData = asyncHandler(async (req,res,next)=>{
    const dashboardId = req.params.dashboardId;
    const isDashboardIdValid = validateDashboardId(dashboardId);
    if(!isDashboardIdValid){
        throw new ApiError(422,null,"Invalid Dashboard Id.");
    }
    const rawDashboardData = await Dashboard.findOne({id: dashboardId});
    if(!rawDashboardData){
        throw new ApiError(404,null,"Dashboard not configured.");
    }
    
    const model = getMongooseDataModelById(dashboardId);
    const parsedDashboardData = await parseRawDashboardData(rawDashboardData,model);
    res.status(200).json(new ApiResponse(200, parsedDashboardData, "Dashboard data fetched successfully"));
});
const handleGetDashboardMetadata = asyncHandler(async (req,res,next)=>{
    const dashboardId = req.params.dashboardId;
    const isDashboardIdValid = validateDashboardId(dashboardId);
    if(!isDashboardIdValid){
        throw new ApiError(422,null,"Invalid Dashboard Id.");
    }
    const dashboardMetaData = await Dashboard.findOne({id: dashboardId});
    res.status(200).json(new ApiResponse(200, dashboardMetaData, "Dashboard metadata fetched successfully"));
});

const handleConfigureDashboard = asyncHandler(async (req,res,next)=>{
    const data = configureDashboardSchema.parse(req.body);
    const isDashboardIdValid = validateDashboardId(data.id);
    if(!isDashboardIdValid){
        throw new ApiError(422,null,"Invalid Dashboard Id.");
    }
    const areTilesValid = validateConfigureDashboardTiles(data.id,data.tiles);
    const areElementsValid = validateConfigureDashboardElements(data.id,data.elements);
    if(!areTilesValid || !areElementsValid){
        throw new ApiError(422,null,!areTilesValid ? "Some tiles info are incorrect." : "Some elements info are incorrect.");
    }

    const tilesWithQueries = getTilesWithQueriesAttached(data.tiles);
    const elementsWithQueries = getElementsWithQueriesAttached(data.elements);
    const tilesWithRemovedIds = tilesWithQueries.map(({_id, ...rest}) => rest);
    const elementsWithRemovedIds = elementsWithQueries.map(({_id, ...rest}) => rest);   
    data.tiles = tilesWithRemovedIds;
    data.elements = elementsWithRemovedIds;

    const newDashboardDocument = await Dashboard.findOneAndUpdate({id: data.id},data,{upsert:true,new:true});
    res.status(200).json(new ApiResponse(200,newDashboardDocument,"Dashboard configured successfully."));
})


module.exports={handleGetDashboardMetadata,handleGetDashboardData,handleConfigureDashboard};
 