const express = require('express');
const Invoice = require('../models/Invoice');
const authorizeClient = require('../middlewares/authorizeClient');
const invoiceRouter = express.Router();

// Get all invoices
invoiceRouter.get('/',(req,res,next)=>{authorizeClient(["view:invoices"])(req,res,next)},getPaginatedInvoices);

// Get single invoice
invoiceRouter.get('/:id',(req,res,next)=>{authorizeClient(["view:invoices"])(req,res,next)},getInvoiceById);

// Create new invoice
invoiceRouter.post('/create',(req,res,next)=>{authorizeClient(["create:invoices"])(req,res,next)},createInvoice);

// Update invoice
invoiceRouter.put('/:id', (req,res,next)=>{authorizeClient(["edit:invoices"])(req,res,next)}, updateInvoice);

// Delete invoice
invoiceRouter.delete('/:id', (req,res,next)=>{authorizeClient(["delete:invoices"])(req,res,next)}, deleteInvoice);

module.exports = invoiceRouter;