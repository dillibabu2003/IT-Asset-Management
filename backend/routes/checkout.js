const {Router} = require('express');
const {assignItem , assignBulkItems } = require('../controllers/checkout');

const checkoutRouter = Router();

checkoutRouter.post('/individual', assignItem );
checkoutRouter.post('/bulk', assignBulkItems );

module.exports = checkoutRouter;