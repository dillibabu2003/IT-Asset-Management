const asyncHandler = require("../utils/asyncHandler");
const Invoice = require("../models/invoice");
const License = require("../models/license");
const Asset = require("../models/asset");
const ApiResponse = require("../utils/ApiResponse");
const { default: mongoose } = require("mongoose");
const ApiError = require("../utils/ApiError");
const UserColumnVisibilities = require("../models/userPreference");

const convertYearsToNumbers = (years) => {
  if (years === "1year") return 1;
  else if (years === "2years") return 2;
  else if (years === "3years") return 3;
  else if (years === "4years") return 4;
};

async function fetchPaginatedDocuments(limit, skip) {
  const aggregateQuery = [
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];
  return Invoice.aggregate(aggregateQuery).exec();
}

const createInvoice = asyncHandler(async (req, res) => {
  const allInvoiceData = req.body;
  const requiredInvoicedata = {};
  //Creating Invoices
  requiredInvoicedata.upload_date = new Date();
  requiredInvoicedata.invoice_date = allInvoiceData.invoice_date;
  requiredInvoicedata.invoice_description = allInvoiceData.invoice_description;
  requiredInvoicedata.vendor_name = allInvoiceData.vendor_name;
  requiredInvoicedata.amount = allInvoiceData.total_amount;
  requiredInvoicedata.invoice_id = allInvoiceData.invoice_id;
  requiredInvoicedata.owner_name = allInvoiceData.owner_name;
  requiredInvoicedata.invoice_filename = allInvoiceData.invoice_filename;
  requiredInvoicedata.data = {};
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const invoice = new Invoice(requiredInvoicedata);
    console.log(invoice);
    await invoice.save({ session: session });

    // Adding Licenses
    if (allInvoiceData.licenses.length) {
      console.log("licenses: " + JSON.stringify(allInvoiceData.licenses));
      const initialLicenses = allInvoiceData.licenses;
      for (let i = 0; i < initialLicenses.length; i++) {
        initialLicenses[i].invoice_id = invoice._id;
        initialLicenses[i].start = initialLicenses[i].warranty_start_date;
        delete initialLicenses[i].warranty_start_date;
        initialLicenses[i].end = new Date(initialLicenses[i].start);
        initialLicenses[i].end.setFullYear(
          initialLicenses[i].end.getFullYear() +
            convertYearsToNumbers(
              initialLicenses[i].warranty_period ?? "3years",
            ),
        );
      }
      const licenses = await License.insertMany(initialLicenses, {
        session: session,
      });
      requiredInvoicedata.data["licenses"] = licenses;
    }

    //Adding Assets
    if (allInvoiceData.assets.length) {
      // console.log("assets: "+JSON.stringify(allInvoiceData.assets));
      const initialAssets = allInvoiceData.assets;

      for (let i = 0; i < initialAssets.length; i++) {
        initialAssets[i].invoice_id = invoice._id;
        initialAssets[i].start = initialAssets[i].warranty_start_date;
        delete initialAssets[i].warranty_start_date;
        delete initialAssets[i].warranty_type;
        initialAssets[i].end = new Date(initialAssets[i].start);
        initialAssets[i].end.setFullYear(
          initialAssets[i].end.getFullYear() +
            convertYearsToNumbers(initialAssets[i].warranty_period ?? "3years"),
        );
      }
      // console.log("filtered Assets: "+initialAssets);
      const assets = await Asset.insertMany(initialAssets, {
        session: session,
      });
      requiredInvoicedata.data["assets"] = assets;
    }
    console.log(JSON.stringify(requiredInvoicedata));
    // const updatedInvoice=await Invoice.findByIdAndUpdate(invoice._id,{requiredInvoicedata});
    invoice.data = requiredInvoicedata.data;
    await invoice.save({ session: session });
    await session.commitTransaction();
    res
      .status(200)
      .json(new ApiResponse(200, invoice, "Invoice Created Successfully"));
  } catch (err) {
    session.abortTransaction();
    res.status(400).json(new ApiError(400, err, "Error Creating Invoice"));
  } finally {
    session.endSession();
  }
});
const updateInvoice = asyncHandler(async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (invoice) {
      res.json(invoice);
    } else {
      res.status(404).json({ message: "Invoice not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
const deleteInvoice = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();
    const { invoice_id } = req.body;
    console.log(invoice_id);
    const invoice = await Invoice.findOne({ invoice_id: invoice_id }, null, {
      session: session,
    });
    console.log("invoice" + invoice);
    if (!invoice) {
      throw new ApiError(422, null, "Invoice id is required");
    }
    console.log("license");
    if (invoice.data.has("licenses")) {
      await License.deleteMany(
        { invoice_id: invoice._id },
        { session: session },
      );
    }
    if (invoice.data.has("assets")) {
      await Asset.deleteMany({ invoice_id: invoice._id }, { session: session });
    }
    const deletedInvoice = await Invoice.deleteOne(
      { invoice_id: invoice_id },
      { session: session },
    );
    await session.commitTransaction();
    res
      .status(200)
      .json(new ApiResponse(200, deletedInvoice, "Invoice deleted Succefully"));
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(400).json(new ApiError(400, err, "Error Deleting Invoice"));
  } finally {
    session.endSession();
  }
});

const getPaginatedInvoices = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  if (!page || !limit) {
    throw new ApiError(400, "Invalid query parameters");
  }
  const parsedPageNumber = parseInt(page);
  const parsedDocumentsLimit = parseInt(limit);
  const skip = (parsedPageNumber - 1) * parsedDocumentsLimit;
  if (isNaN(parsedPageNumber) || isNaN(parsedDocumentsLimit)) {
    throw new ApiError(400, "Invalid query parameters");
  }
  const totalInvoices = await Invoice.countDocuments();
  const invoices = await fetchPaginatedDocuments(parsedDocumentsLimit, skip);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { invoices: [...invoices], totalInvoices: totalInvoices },
        "Invoices fetched successfully",
      ),
    );
});

const getInvoiceById = asyncHandler(async (req, res) => {
  const { invoice_id } = req.body;
  const invoice = await Invoice.find({ invoice_id: invoice_id });
  res.json(
    new ApiResponse(invoice, { message: "Invoice Fetched Successfully" }),
  );
});
const getUserColumnVisibilities = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const allColumnVisibilites = await UserColumnVisibilities.findOne({
    user_id: userId,
  });
  if (!allColumnVisibilites) {
    throw new ApiError(400, null, "User preferences not found");
  }

  const invoicePreferences =
    allColumnVisibilites.visible_fields.get("invoices");
  if (!invoicePreferences) {
    throw new ApiError(400, null, "Invalid object name");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        invoicePreferences,
        `Invoices Column preferences fetched successfully.`,
      ),
    );
});
module.exports = {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getPaginatedInvoices,
  getInvoiceById,
  getUserColumnVisibilities,
};
