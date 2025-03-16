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
        type_reference_model: objectName == "assets" ? "Asset" : "License",
        start: new Date(),
        employee_id: employee_info._id,
    });
    return checkout;
}
async function validateAvailabilityAndReturnItems(model, serial_numbers) {    
    const items = await model.find({serial_no: {$in: serial_numbers}, status: {$in: ["available","reissue"]}});
    return items;
}
async function validateEmployeeAndReturnEmployeeDetails(employee_id) {
    const employeeDetails = await Employee.findOne({ employee_id: employee_id });
    if (!employeeDetails) {
        throw new ApiError(400, null, 'Employee does not exist');
    }
    return employeeDetails;
}
async function executeAssignItemsCheckoutTransaction(model, serial_numbers, objectName, employees_info) {
    //TODO: check whether this is handling assigning the previously assigned assets to new employee or assigning new assets to new employee
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const availableItems = await validateAvailabilityAndReturnItems(model, serial_numbers);
        if (availableItems.length < serial_numbers.length) {
            throw new ApiError(400, null, 'Checkout denied due to unavailability');
        }
        const entireCheckoutCountTillNow = await Checkout.countDocuments({}, { session: session });
        for (let i = 0; i < availableItems.length; i++) {
            
            //Check if employee exists and get employee details
            const employeeDetails = await validateEmployeeAndReturnEmployeeDetails(employees_info[i].employee_id);
            if(!employeeDetails){
                throw new ApiError(400, null, `Employee does not exist with id ${employees_info[i].employee_id}`);
            }
            
            //Calculate total checkouts till now of this employee
            
            const totalCheckoutsTillNowOfEmployee = await Checkout.find({ employee_id: employeeDetails._id }, { session: session }).countDocuments();
            //Update item status and assign to employee
            availableItems[i].status = objectName == "assets" ? "deployed" : "activated";
            availableItems[i].assigned_to = employeeDetails._id;

            //Create checkout record
            
            const checkout = createCheckout(objectName, employeeDetails, availableItems[i]._id, entireCheckoutCountTillNow + i + 1);

            //Save item and checkout record
            await checkout.save({ session: session });
            await availableItems[i].save({ session: session });
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
                { end: new Date(Date.now()) },
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


//Controller Functions
const assignItem = asyncHandler(async (req, res) => {
    const { object_name, employee_info, serial_no } = req.body;
    //Write zod schema for this
    if (!object_name || !employee_info || !employee_info.employee_id || !serial_no) {
        throw new ApiError(422, null, 'Invalid checkout information');
    }
    const model = getModelByObjectName(object_name);
    if (!model) {
        throw new ApiError(400, null, 'Invalid Checkout');
    }
    await executeAssignItemsCheckoutTransaction(model, [serial_no], object_name, [employee_info], 1);
    res.status(200).json(new ApiResponse(200, null, 'Checkout successfull'));
});

const assignBulkItems = asyncHandler(async (req, res) => {
    const { object_name, info_to_assign } = req.body;
    //Write zod schema for this
    if (!object_name || !info_to_assign || info_to_assign.length == 0) {
        throw new ApiError(422, null, 'Invalid checkout information object_name or info_to_assing is missing.');
    }
    const model = getModelByObjectName(object_name);
    if (!model) {
        throw new ApiError(400, null, 'Invalid Checkout');
    }
    const serial_numbers = info_to_assign.map(item => item.serial_no);
    const employee_ids = info_to_assign.map(item => {return {employee_id: item.employee_id}});
    if (new Set(serial_numbers).size !== serial_numbers.length) {
        throw new ApiError(400, null, 'Duplicate serial numbers found');
    }

    await executeAssignItemsCheckoutTransaction(model, serial_numbers, object_name,employee_ids);
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
    if (!object_name || !info_to_unassign ||info_to_unassign.length == 0) {
        throw new ApiError(422, null, 'Invalid checkout information item type or employee info or filters or required count is missing.');
    }
    const model = getModelByObjectName(object_name);
    if (!model) {
        throw new ApiError(400, null, 'Invalid Checkout');
    }
    await executeUnassignItemsCheckoutTransaction(model, object_name, info_to_unassign);

    res.status(200).json(new ApiResponse(200, null, 'Unassignment successfull'));
});

const getPaginatedCheckouts = asyncHandler(async (req, res) => {
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
    const totalCheckouts = await Checkout.countDocuments();
    const checkouts = await Checkout.find()
        .populate('employee_id')
        .populate('type_reference_id')
        .skip(skip)
        .limit(parsedDocumentsLimit);
    res.status(200).json(new ApiResponse(200, { checkouts: [...checkouts], total: totalCheckouts }, 'Checkouts fetched successfully')); 
    });
module.exports = { assignItem, assignBulkItems, unAssignItem, unAssignBulkItems,getPaginatedCheckouts };