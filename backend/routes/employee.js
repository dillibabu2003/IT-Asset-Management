const { Router } = require("express");
const authorizeClient = require("../middlewares/authorizeClient");

const employeeRouter = Router();
// const {getEmployees, getEmployee, createEmployee, xupdateEmployee, deleteEmployee} = require('../controllers/employee');
const { getEmployeesBySearchTerm } = require("../controllers/employee");

// employeeRouter.get("/",(req,res,next)=>{authorizeClient([`view:employees`])(req,res,next)},getEmployees);

employeeRouter.post(
  "/search",
  (req, res, next) => {
    authorizeClient(["view:employees"])(req, res, next);
  },
  getEmployeesBySearchTerm,
);

module.exports = employeeRouter;
