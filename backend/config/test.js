const Asset = require("../models/asset");
const mongoose = require("mongoose");

// remove this after testing

const init = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017", {
      //CHANGE TO CLUSTER IF WORKS IN LOCAL
      dbName: "it-asset-management",
      timeoutMS: 50000,
    });
  } catch (error) {
    console.error("Error dropping database:", error);
    process.exit();
  }
};
init().then(async () => {
  const aggregateQuery = [
    {
      $skip: 0,
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: "invoices",
        localField: "invoice_id",
        foreignField: "_id",
        as: "invoice_info",
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "assigned_to",
        foreignField: "_id",
        as: "employee_info",
      },
    },
    {
      $addFields: {
        invoice_id: { $first: "$invoice_info.invoice_id" },
        date_of_received: { $first: "$invoice_info.date_of_received" },
        name_of_the_vendor: { $first: "$invoice_info.name_of_the_vendor" },
        employee_name: { $first: "$employee_info.name" },
        assigned_to: { $first: "$employee_info.employee_id" },
      },
    },
    {
      $project: {
        invoice_info: 0,
        employee_info: 0,
      },
    },
  ];
  let assets = await Asset.aggregate(aggregateQuery);
  // let assets = await Asset.findOne();
  console.log(assets.expiry);

  assets = JSON.stringify(assets);
  console.log(JSON.parse(assets));
});
