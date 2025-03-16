const express = require('express');
const Invoice = require('../models/invoice');
const authorizeClient = require('../middlewares/authorizeClient');
const invoiceRouter = express.Router();
const {createInvoice,updateInvoice,deleteInvoice,getPaginatedInvoices,getInvoiceById}=require('../controllers/invoice')

// Get Paginated invoices
invoiceRouter.get('/paginate',(req,res,next)=>{authorizeClient(["view:invoices"])(req,res,next)},getPaginatedInvoices);

// // Get single invoice
// invoiceRouter.get('/:id',(req,res,next)=>{authorizeClient(["view:invoices"])(req,res,next)},getInvoiceById);

// Create new invoice
invoiceRouter.post('/create',(req,res,next)=>{authorizeClient(["create:invoices"])(req,res,next)},createInvoice);

// // Update invoice
// invoiceRouter.put('/:id', (req,res,next)=>{authorizeClient(["edit:invoices"])(req,res,next)}, updateInvoice);

// Delete invoice
invoiceRouter.delete('/delete', (req,res,next)=>{authorizeClient(["delete:invoices"])(req,res,next)}, deleteInvoice);

module.exports = invoiceRouter;