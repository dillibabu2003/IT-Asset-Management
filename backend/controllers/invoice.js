const asyncHandler = require('../utils/asyncHandler');
const Invoice = require('../models/Invoice');
const createInvoice=asyncHandler(async (req, res) => {
    const invoice = new Invoice(req.body);
    try {
        const newInvoice = await invoice.save();
        res.status(201).json(newInvoice);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})
const updateInvoice = asyncHandler(async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (invoice) {
            res.json(invoice);
        } else {
            res.status(404).json({ message: 'Invoice not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})
const deleteInvoice=asyncHandler(async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        if (invoice) {
            res.json({ message: 'Invoice deleted' });
        } else {
            res.status(404).json({ message: 'Invoice not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})
module.exports={
    createInvoice,
    updateInvoice,
    deleteInvoice
}