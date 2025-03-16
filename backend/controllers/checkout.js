const asyncHandler = require('../utils/asyncHandler');
const Employee = require('../models/employee');
const { getModelByObjectName } = require('./dynamic_object');
const Checkout = require('../models/checkout');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');
const ApiResponse = require('../utils/ApiResponse');

function createCheckout(objectName, employee_info, refId, checkout_id) {
    
    
    const checkout = new Checkout({
        checkout_id: `CHK${checkout_id}`,
        type: objectName,
        type_reference_id: refId,
        start: new Date(),
        employee_id: employee_info._id,
    });
    return checkout;
}
async function validateAvailabilityAndReturnItems(model, filters, requiredCount) {
    const items = await model.find({ ...filters }).limit(requiredCount);
    const availableCount = items?.length || 0;
    const result = { areAvailable: availableCount >= requiredCount, items: items };
    // console.log(result);

    return result;
}
async function validateEmployeeAndReturnEmployeeDetails(employee_id) {
    const employeeDetails = await Employee.findOne({ employee_id: employee_id });
    if (!employeeDetails) {
        throw new ApiError(400, null, 'Employee does not exist');
    }
    return employeeDetails;
}
async function executeAssignItemsCheckoutTransaction(model, filters, objectName, employees_info, requiredItemCount) {
    //TODO: check whether this is handling assigning the previously assigned assets to new employee or assigning new assets to new employee
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { areAvailable, items } = await validateAvailabilityAndReturnItems(model, filters, requiredItemCount);
        if (!areAvailable) {
            throw new ApiError(400, null, 'Checkout denied due to unavailability');
        }
        const entireCheckoutCountTillNow = await Checkout.countDocuments({}, { session: session });
        for (let i = 0; i < requiredItemCount; i++) {
            
            //Check if employee exists and get employee details
            const employeeDetails = await validateEmployeeAndReturnEmployeeDetails(employees_info[i].employee_id);
            
            // const totalCheckoutsTillNowOfEmployee = await Checkout.countDocuments({ employee_id: employees_info[i]._id }, { session: session });
            
            console.log("employeeee"+employeeDetails);
            //Calculate total checkouts till now of this employee

            //Update item status and assign to employee
            items[i].status = objectName == "assets" ? "deployed" : "activated";
            items[i].assigned_to = employeeDetails._id;

            //Create checkout record
            
            const checkout = createCheckout(objectName, employeeDetails, items[i]._id, entireCheckoutCountTillNow + i + 1);

            //Save item and checkout record
            await checkout.save({ session: session });
            await items[i].save({ session: session });
        }
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, error, 'Checkout failed');
    }
    finally {
        await session.endSession();
    }
}
async function executeUnassignItemsCheckoutTransaction(model, objectName, infoToUnassign) {
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
            if (item.end && item.end <= new Date()) {
                item.status = 'archived';
            }
            else {
                item.status = 'reissue';
            }
            item.assigned_to = null;
            if (objectName == "assets") {
                item.asset_id = null;
            } else {
                item.license_id = null;
            }
            await item.save({ session: session });
        }

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, error, 'Checkout failed');
    }
    finally {
        await session.endSession();
    }
}



const assignItem = asyncHandler(async (req, res) => {
    const { object_name, employee_info, filters } = req.body;
    //Write zod schema for this
    if (!object_name || !employee_info || !employee_info.employee_id || !filters || typeof filters !== 'object' || (filters.status != "available" && filters.status != "reissue")) {
        throw new ApiError(422, null, 'Invalid checkout information');
    }
    const model = getModelByObjectName(object_name);
    if (!model) {
        throw new ApiError(400, null, 'Invalid Checkout');
    }
    await executeAssignItemsCheckoutTransaction(model, filters, object_name, [employee_info], 1);
    res.status(200).json(new ApiResponse(200, null, 'Checkout successfull'));
});

const assignBulkItems = asyncHandler(async (req, res) => {
    const { object_name, employees_info, filters } = req.body;
    //Write zod schema for this
    if (!object_name || !employees_info || employees_info.length == 0 || !filters || typeof filters !== 'object' || (filters.status != "available" && filters.status != "reissue")) {
        throw new ApiError(422, null, 'Invalid checkout information item type or employee info or filters or required count is missing.');
    }
    const model = getModelByObjectName(object_name);
    if (!model) {
        throw new ApiError(400, null, 'Invalid Checkout');
    }
    await executeAssignItemsCheckoutTransaction(model, filters, object_name, employees_info, employees_info.length);
    res.status(200).json(new ApiResponse(200, null, 'Checkout successfull'));
});

const unAssignItem = asyncHandler(async (req, res) => {
    const { object_name, info_to_unassign } = req.body;
    console.log(req.body);

    //Write zod schema for this
    if (!object_name || typeof info_to_unassign != "object" || !info_to_unassign.serial_no || !info_to_unassign.employee_id) {
        throw new ApiError(422, null, 'Invalid checkout information item type or employee info or filters or required count is missing.');
    }
    const model = getModelByObjectName(object_name);
    if (!model) {
        throw new ApiError(400, null, 'Invalid Checkout');
    }
    await executeUnassignItemsCheckoutTransaction(model, object_name, [info_to_unassign]);

    res.status(200).json(new ApiResponse(200, null, 'Unassignment successfull'));
});

const unAssignBulkItems = asyncHandler(async (req, res) => {
    const { object_name, info_to_unassign } = req.body;
    //Write zod schema for this
    if (!object_name || info_to_unassign.length == 0) {
        throw new ApiError(422, null, 'Invalid checkout information item type or employee info or filters or required count is missing.');
    }
    const model = getModelByObjectName(object_name);
    if (!model) {
        throw new ApiError(400, null, 'Invalid Checkout');
    }
    await executeUnassignItemsCheckoutTransaction(model, object_name, info_to_unassign);

    res.status(200).json(new ApiResponse(200, null, 'Unassignment successfull'));
});
module.exports = { assignItem, assignBulkItems, unAssignItem, unAssignBulkItems };