const express = require("express");
const authorizeClient = require("../middlewares/authorizeClient");
const invoiceRouter = express.Router();
const {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getPaginatedInvoices,
  getInvoiceById,
  getUserColumnVisibilities,
} = require("../controllers/invoice");

// Get Paginated invoices
invoiceRouter.get(
  "/paginate",
  (req, res, next) => {
    authorizeClient(["view:invoices"])(req, res, next);
  },
  getPaginatedInvoices,
);

// Create new invoice
invoiceRouter.post(
  "/create",
  (req, res, next) => {
    authorizeClient(["create:invoices"])(req, res, next);
  },
  createInvoice,
);

// // Update invoice
invoiceRouter.put(
  "/update",
  (req, res, next) => {
    authorizeClient(["edit:invoices"])(req, res, next);
  },
  updateInvoice,
);

// Delete invoice
invoiceRouter.delete(
  "/delete",
  (req, res, next) => {
    authorizeClient(["delete:invoices"])(req, res, next);
  },
  deleteInvoice,
);

invoiceRouter.get(
  "/column-visibilities",
  (req, res, next) => {
    authorizeClient([`view:invoices`])(req, res, next);
  },
  getUserColumnVisibilities,
);
// // Get single invoice
invoiceRouter.get(
  "/:id",
  (req, res, next) => {
    authorizeClient(["view:invoices"])(req, res, next);
  },
  getInvoiceById,
);

module.exports = invoiceRouter;
