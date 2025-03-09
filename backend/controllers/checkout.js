const asyncHandler = require('../utils/asyncHandler');
const Metadata = require('../models/metadata');
const Employee =  require('../models/employee');
const {getModelByObjectId} = require('./dynamic_object');
const Checkout = require('../models/checkout');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');
const ApiResponse = require('../utils/ApiResponse');

async function createCheckout(object_id, employee_info,refId, checkout_id){
    const checkout = new Checkout({
        checkout_id: `CHK${checkout_id}`,
        type: object_id,
        type_reference_id: refId,
        employee_id: employee_info.employee_id,
    });
    return checkout;
}
async function validateAvailabilityAndReturnItems(model, filters, requiredCount){
    const items = await model.find({...filters}).limit(requiredCount);
    const availableCount = items?.length || 0;
    const result = {areAvailable: availableCount >= requiredCount, items: items};
    return result;
}
async function executeCheckoutTransaction(model, filters, object_id, employees_info, requiredItemCount){
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const {areAvailable, items} = await validateAvailabilityAndReturnItems(model, filters,requiredItemCount);
        if(!areAvailable){
            throw new ApiError(400,null,'Checkout denied due to unavailability');
        }
        const entireCheckoutCountTillNow = await Checkout.countDocuments({},{session: session});
        for (let i = 0; i < requiredItemCount; i++) {
            const isEmployeeExists = await Employee.exists({employee_id: employees_info[i].employee_id});
            if(!isEmployeeExists){
                throw new ApiError(400,null,'Employee does not exist');
            }
            const totalCheckoutsTillNowOfEmployee = await Checkout.countDocuments({employee_id: employees_info[i].employee_id},{session: session});            
            const generatedId = items[i].generateId(employees_info[i].employee_id,totalCheckoutsTillNowOfEmployee);
            items[i].status = "deployed";
            items[i].assigned_to = employees_info[i]._id;
            const checkout = await createCheckout(object_id, employees_info[i],items[i]._id,entireCheckoutCountTillNow+i+1);
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

const handleIndividualCheckout = asyncHandler(async (req, res) => {
    const {object_id,employee_info,filters} = req.body;
    if(!object_id || !employee_info|| !employee_info.employee_id || !filters || typeof filters !== 'object'||(filters.status!="available" &&filters.status!="reissue") ){
        throw new ApiError(422,null,'Invalid checkout information');
    }
    const model = getModelByObjectId(object_id);
    if(!model){
        throw new ApiError(400,null,'Invalid Checkout');
    }
    await executeCheckoutTransaction(model, filters, object_id, [employee_info],1);
    res.status(200).json(new ApiResponse(200,null,'Checkout successfull'));
});

const handleBulkCheckout = asyncHandler(async (req, res) => {
    const {object_id,employees_info,filters,requiredItemCount} = req.body;
    if(!object_id || !employees_info|| employees_info.length==0 || !filters || typeof filters !== 'object'||filters.status!="available" ||filters.status!="reissue"){
        throw new ApiError(422,null,'Invalid checkout information');
    }
    const model = getModelByObjectId(object_id);
    if(!model){
        throw new ApiError(400,null,'Invalid Checkout');
    }
    await executeCheckoutTransaction(model, filters, object_id, employees_info,requiredItemCount);
    res.status(200).json(new ApiResponse(200,null,'Checkout successfull'));
});
module.exports = {handleIndividualCheckout, handleBulkCheckout};