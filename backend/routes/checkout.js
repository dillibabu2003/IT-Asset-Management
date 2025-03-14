const {Router} = require('express');
const {assignBulkItems, assignItem, unAssignBulkItems, unAssignItem, getPaginatedCheckouts} = require('../controllers/checkout');
const authorizeClient = require('../middlewares/authorizeClient');

const checkoutRouter = Router();

checkoutRouter.get('/',(req,res,next)=>{ authorizeClient([`view:checkouts`])(req,res,next)},getPaginatedCheckouts);
checkoutRouter.post('/assign/individual',(req,res,next)=>{ authorizeClient([`create:checkouts`])(req,res,next)}, assignItem);
checkoutRouter.post('/assign/bulk',(req,res,next)=>{ authorizeClient([`create:checkouts`])(req,res,next)}, assignBulkItems);
checkoutRouter.post('/unassign/individual',(req,res,next)=>{ authorizeClient([`edit:checkouts`])(req,res,next)}, unAssignItem);
checkoutRouter.post('/unassign/bulk',(req,res,next)=>{ authorizeClient([`edit:checkouts`])(req,res,next)}, unAssignBulkItems);

module.exports = checkoutRouter;