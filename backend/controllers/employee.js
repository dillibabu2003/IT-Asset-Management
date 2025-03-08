const asyncHandler = require('../utils/asyncHandler');
const Employee = require('../models/employee');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const getEmployeesBySearchTerm = asyncHandler(async (req, res) => {
    const {search_key} = req.body;
    if (search_key==undefined) {
        throw new ApiError(400,null, "Invalid search term");
    }
    if(search_key.trim().length === 0){
        const firstTenDocuments = await Employee.find().limit(10);
        res.status(200).json(new ApiResponse(200, firstTenDocuments, `Employees fetched successfully`));
        return;
    }
    const employeeData = await Employee.aggregate([
                {
                      $search: {
                          index: "EmployeeIndex",
                          text: {
                            query: search_key,
                            path: ["employee_id","firstname","lastname"],
                            fuzzy: {
                                  prefixLength: 2,
                                //   maxEdits: 2,
                            },
                          }
                      }
               } 
          ]);
    const totalDocuments = employeeData.length;
    if(totalDocuments === 0){
        throw new ApiError(404,null, "No documents found");
    }
    res.status(200).json(new ApiResponse(200, employeeData, `Users fetched successfully`));
});

module.exports={
    getEmployeesBySearchTerm
}