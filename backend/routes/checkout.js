const {Router} = require('express');
const {handleIndividualCheckout, handleBulkCheckout} = require('../controllers/checkout');

const checkoutRouter = Router();

checkoutRouter.post('/individual', handleIndividualCheckout);
checkoutRouter.post('/bulk', handleBulkCheckout);

module.exports = checkoutRouter;