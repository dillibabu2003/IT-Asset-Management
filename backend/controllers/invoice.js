const asyncHandler = require('../utils/asyncHandler');
const Invoice = require('../models/invoice');
const License=require('../models/license');
const Asset=require('../models/asset');
const ApiResponse = require('../utils/ApiResponse');
const { default: mongoose } = require('mongoose');
const convertYearsToNumbers=(years)=>{
    if(years==='1year')return 1;
    else if(years==='2years')return 2;
    else if(years==='3years')return 3;
    else if(years==='4years')return 4;
}
const createInvoice=asyncHandler(async (req, res) => {
    const allInvoiceData=req.body;
    const requiredInvoicedata={};
    //Creating Invoices
    requiredInvoicedata.date_of_upload=new Date();
    requiredInvoicedata.date_of_received=allInvoiceData.invoice_date;
    requiredInvoicedata.vendor_name=allInvoiceData.vendor_name;
    requiredInvoicedata.amount=allInvoiceData.total_amount;
    requiredInvoicedata.invoice_id=allInvoiceData.invoice_id;
    requiredInvoicedata.data={};
    const session=await mongoose.startSession();
    try {
        session.startTransaction();
        const invoice = new Invoice(requiredInvoicedata);
        console.log(invoice);
        await invoice.save({session:session});

        // Adding Licenses
        if(allInvoiceData.licenses.length){
            console.log("licenses: "+JSON.stringify(allInvoiceData.licenses));
            const initialLicenses=allInvoiceData.licenses;
            for(let i=0;i<initialLicenses.length;i++){
                initialLicenses[i].invoice_id=invoice._id;
                initialLicenses[i].start=initialLicenses[i].warranty_start_date;
                delete initialLicenses[i].warranty_start_date;
                initialLicenses[i].end = new Date(initialLicenses[i].start);
                initialLicenses[i].end.setFullYear(initialLicenses[i].end.getFullYear() + convertYearsToNumbers(initialLicenses[i].warranty_period));
            }
            const licenses=await License.insertMany(initialLicenses,{session:session});
            requiredInvoicedata.data["licenses"]=licenses;
        }

        //Adding Assets
        if(allInvoiceData.assets.length){
            console.log("assets: "+JSON.stringify(allInvoiceData.assets));
            const initialAssets=allInvoiceData.assets
            
            for(let i=0;i<initialAssets.length;i++){
               initialAssets[i].invoice_id=invoice._id;
               initialAssets[i].start=initialAssets[i].warranty_start_date;
               delete initialAssets[i].warranty_start_date;
               delete initialAssets[i].warranty_type;
               initialAssets[i].end = new Date(initialAssets[i].start);
               initialAssets[i].end.setFullYear(initialAssets[i].end.getFullYear() + convertYearsToNumbers(initialAssets[i].warranty_period));

            }
            console.log("filtered Assets: "+initialAssets); 
            const assets=await Asset.insertMany(initialAssets,{session:session});
            requiredInvoicedata.data["assets"]=assets;
        }
        console.log(JSON.stringify(requiredInvoicedata));
        // const updatedInvoice=await Invoice.findByIdAndUpdate(invoice._id,{requiredInvoicedata});
        invoice.data=requiredInvoicedata.data;
        await invoice.save({session:session});
        await session.commitTransaction();
        res.status(200).json(new ApiResponse(200,invoice,"Invoice Created Successfully"));
    } catch (err) {
        session.abortTransaction();
        res.status(400).json({ message: err.message });
    }finally{
       session.endSession();
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

const getPaginatedInvoices=asyncHandler(async(req,res)=>{
       const allInovices=await Invoice.find();
        res.json(new ApiResponse(allInovices,{message:'All Invoice Fetched Successfully '}));
})

const getInvoiceById=asyncHandler(async(req,res)=>{
      const invoiceId=req.body.invoice_id;
      const invoice=await Invoice.find({invoice_id:invoiceId});
      res.json(new ApiResponse(invoice,{message:'Invoice Fetched Successfully'}));
})
module.exports={
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getPaginatedInvoices,
    getInvoiceById
}