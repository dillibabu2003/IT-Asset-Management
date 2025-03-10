const asyncHandler = require('../utils/asyncHandler');
const Metadata = require('../models/metadata');
const Employee =  require('../models/employee');
const {getModelByObjectId} = require('./dynamic_object');
const Checkout = require('../models/checkout');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');
const ApiResponse = require('../utils/ApiResponse');

async function createCheckout(objectName, employee_info,refId, checkout_id){
    const checkout = new Checkout({
        checkout_id: `CHK${checkout_id}`,
        type: objectName,
        type_reference_id: refId,
        employee_id: employee_info._id,
    });
    return checkout;
}
async function validateAvailabilityAndReturnItems(model, filters, requiredCount){
    const items = await model.find({...filters}).limit(requiredCount);
    const availableCount = items?.length || 0;
    const result = {areAvailable: availableCount >= requiredCount, items: items};
    console.log(result);
    
    return result;
}
async function validateEmployeeAndReturnEmployeeDetails(employee_id){
    const employeeDetails = await Employee.findOne({employee_id: employee_id});
    if(!employeeDetails){
        throw new ApiError(400,null,'Employee does not exist');
    }    
    return employeeDetails;
}
async function executeAssignItemCheckoutTransaction(model, filters, objectName, employees_info, requiredItemCount){
    //TODO: check whether this is handling assigning the previously assigned assets to new employee or assigning new assets to new employee
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const {areAvailable, items} = await validateAvailabilityAndReturnItems(model, filters,requiredItemCount);
        if(!areAvailable){
            throw new ApiError(400,null,'Checkout denied due to unavailability');
        }
        const entireCheckoutCountTillNow = await Checkout.countDocuments({},{session: session});
        for (let i = 0; i < requiredItemCount; i++) {            
            const employeeDetails = await validateEmployeeAndReturnEmployeeDetails(employees_info[i].employee_id);
            const totalCheckoutsTillNowOfEmployee = await Checkout.countDocuments({employee_id: employees_info[i].employee_id},{session: session});            
            const generatedId = items[i].generateId(employeeDetails.employee_id,totalCheckoutsTillNowOfEmployee);
            items[i].status = objectName=="assets" ? "deployed" : "activated";
            items[i].assigned_to = employeeDetails._id;
            const checkout = await createCheckout(objectName, employeeDetails,items[i]._id,entireCheckoutCountTillNow+i+1);
            await checkout.save({session: session});
            await items[i].save({session: session});
        }
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        if(error instanceof ApiError){
            throw error;
        }
        throw new ApiError(500,error,'Checkout failed');
    }
    finally{
        await session.endSession();
    }
}
async function executeUnassignItemCheckoutTransaction(model, objectName, infoToUnassign){
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        for (let i = 0; i < infoToUnassign.length; i++) {
            const employeeDetails = await validateEmployeeAndReturnEmployeeDetails(infoToUnassign[i].employee_id);
            const item = await model.findOne({ assigned_to: employeeDetails._id, serial_no: infoToUnassign[i].serial_no });
            if (!item) {
                throw new ApiError(400, null, `Item with serial number ${infoToUnassign[i].serial_no} not found or not assigned to this employee`);
            }

            // Update checkout record
            await Checkout.findOneAndUpdate(
                { type_reference_id: item._id, employee_id: employeeDetails._id },
                { end_date: new Date() },
                { session: session }
            );

            // Update item status based on type
            if (objectName === 'licenses') {
                item.status = item.end && item.end <= new Date() ? 'expired' : 'archived';
            } else {
                // For assets
                item.status = item.condition === 'working' ? 'reissue' : 'archived';
            }
            item.assigned_to = null;
            await item.save({ session: session });
        }
        
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        if(error instanceof ApiError){
            throw error;
        }
        throw new ApiError(500,error,'Checkout failed');
    }
    finally{
        await session.endSession();
    }
}

async function executeCheckoutTransaction(type,model, filters, objectName, employees_info, requiredItemCount){
    if(type==="assign"){
        await executeAssignItemCheckoutTransaction(model, filters, objectName, employees_info,requiredItemCount);
    }
    else if(type=="unassign"){
        await executeUnassignItemCheckoutTransaction(model, objectName, employees_info);
    }
    else{
        throw new ApiError(400,null,'Invalid checkout type');
    }
}

const assignItem = asyncHandler(async (req, res) => {
    const {objectName,employee_info,filters} = req.body;
    if(!objectName || !employee_info|| !employee_info.employee_id || !filters || typeof filters !== 'object'||(filters.status!="available" &&filters.status!="reissue") ){
        throw new ApiError(422,null,'Invalid checkout information');
    }
    const model = getModelByObjectId(objectName);
    if(!model){
        throw new ApiError(400,null,'Invalid Checkout');
    }
    await executeCheckoutTransaction(model, filters, objectName, [employee_info],1);
    res.status(200).json(new ApiResponse(200,null,'Checkout successfull'));
});

const assignBulkItems = asyncHandler(async (req, res) => {
    const {objectName,employees_info,filters} = req.body;    
    if(!objectName || !employees_info|| employees_info.length==0 || !filters || typeof filters !== 'object'||(filters.status!="available" &&filters.status!="reissue")){
        throw new ApiError(422,null,'Invalid checkout information item type or employee info or filters or required count is missing.'); 
    }
    const model = getModelByObjectId(objectName);
    if(!model){
        throw new ApiError(400,null,'Invalid Checkout');
    }
    
    await executeCheckoutTransaction(model, filters, objectName, employees_info,employees_info.length);
    res.status(200).json(new ApiResponse(200,null,'Checkout successfull'));
});
module.exports = {assignItem, assignBulkItems};