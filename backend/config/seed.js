const mongoose = require('mongoose');
const Asset = require('../models/asset');
const Checkout = require('../models/checkOut');
const CheckOutItem = require('../models/checkOutItem');
const Invoice = require('../models/invoice');
const License = require('../models/license');
const MetaData = require('../models/metadata');
const Permission = require('../models/permission');
const User = require('../models/user');
const UserVisibility = require('../models/userPreference');
const cleanedEnv = require('../utils/cleanedEnv');
const metadata = require('../models/metadata');

mongoose.connect(cleanedEnv.MONGO_URI, {
    dbName: cleanedEnv.DB_NAME,
});

const seedDB = async () => {
    await mongoose.connection.dropDatabase();

    const user1 = new User({
        user_id: 'U001',
        role: 'admin',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: '1234',
        status: 'active',
        date_of_birth: new Date('1990-01-01'),
        gender: 'male',
    });

    // const user2 = new User({
    //     user_id: 'U002',
    //     role: 'member',
    //     firstname: 'Jane',
    //     lastname: 'Smith',
    //     email: 'jane@example.com',
    //     password: 'password456',
    //     date_of_birth: new Date('1992-02-02'),
    //     gender: 'female',
    // });

    await user1.save();
    // await user2.save();

    // const invoice1 = new Invoice({
    //     invoice_id: 'INV001',
    //     date_of_upload: new Date(),
    //     date_of_received: new Date(),
    //     name_of_the_vendor: 'Vendor A',
    //     amount: 1000.00,
    //     status: 'processed',
    // });

    // await invoice1.save();

    // const asset1 = new Asset({
    //     serial_no: 'SN001',
    //     asset_id: 'A001',
    //     date_of_received: new Date(),
    //     name_of_the_vendor: 'Vendor A',
    //     invoice_id: invoice1._id,
    //     make: 'Dell',
    //     model: 'XPS 13',
    //     ram: '16GB',
    //     storage: '512GB',
    //     processor: 'Intel i7',
    //     os_type: 'windows',
    //     start: new Date(),
    //     end: new Date(),
    //     warranty: '2 years',
    //     status: 'available',
    // });

    // await asset1.save();

    // const checkout1 = new Checkout({
    //     checkout_id: 'CO001',
    //     checkedout_items: [
    //         {
    //             type: 'asset',
    //             qty: 1,
    //         },
    //     ],
    //     date_of_checkout: new Date(),
    //     status: 'processed',
    // });

    // await checkout1.save();

    // const checkoutItem1 = new CheckOutItem({
    //     checkout_id: checkout1._id,
    //     item_id: asset1._id,
    //     item_type: 'Assets',
    //     date_of_checkout: new Date(),
    // });

    // await checkoutItem1.save();

    // const license1 = new License({
    //     license_id: 'LIC001',
    //     date_of_received: new Date(),
    //     name_of_the_vendor: 'Vendor B',
    //     invoice_id: invoice1._id,
    //     make: 'Microsoft',
    //     model: 'Office 365',
    //     start: new Date(),
    //     end: new Date(),
    //     warranty: '1 year',
    //     status: 'available',
    // });

    // await license1.save();

    const permission1 = new Permission({
        role: 'admin',
        permissions: {
            users:{
                create: true,
                update: true,
                delete: true,
            },
            assets: {
                dashboard: true,
                create: true,
                update: true,
                view: true,
                delete: true,
            },
            licenses: {
                dashboard: true,
                create: true,
                update: true,
                view: true,
                delete: true,
            },
            invoices: {
                dashboard: true,
                create: true,
                update: true,
                view: true,
                delete: true,
            },
            checkouts: {
                dashboard: true,
                create: true,
                update: true,
                view: true,
                delete: true,
            },
        },
    });

    await permission1.save();

    const userVisibility = new UserVisibility({
        user_id: user1._id,
        visible_fields: {
            assets: ['make', 'model', 'status'],
            licenses: ['license_id', 'name_of_the_vendor'],
        },
    });

    await userVisibility.save();

    await MetaData.insertMany([
        { belongs_to: "assets", id: 'serial_no', label: 'Serial No', type: 'text', required: true, additional: false },
        { belongs_to: "assets", id: 'asset_id', label: 'Asset Id', type: 'text', required: true, additional: false },
        { belongs_to: "assets", id: 'date_of_received', label: 'Date Of Received', type: 'date', required: true, additional: false },
        { belongs_to: "assets", id: 'name_of_the_vendor', label: 'Name Of The Vendor', type: 'text', required: true, additional: false },
        { belongs_to: "assets", id: 'invoice_id', label: 'Invoice Id', type: 'text', required: true, additional: false },
        { belongs_to: "assets", id: 'make', label: 'Make', type: 'text', required: false, additional: false },
        { belongs_to: "assets", id: 'model', label: 'Model', type: 'text', required: true, additional: false },
        { belongs_to: "assets", id: 'ram', label: 'Ram', type: 'text', required: false, additional: false },
        { belongs_to: "assets", id: 'storage', label: 'Storage', type: 'text', required: false, additional: false },
        { belongs_to: "assets", id: 'processor', label: 'Processor', type: 'text', required: false, additional: false },
        { belongs_to: "assets", id: 'os_type', label: 'Os Type', type: 'text', required: false, additional: false },
        { belongs_to: "assets", id: 'start', label: 'Start', type: 'date', required: true, additional: false },
        { belongs_to: "assets", id: 'end', label: 'End', type: 'date', required: true, additional: false },
        { belongs_to: "assets", id: 'warranty', label: 'Warranty', type: 'text', required: true, additional: false },
        { belongs_to: "assets", id: 'status', label: 'Status', type: 'select', required: true, additional: false, options: [
            { label: 'Available', value: 'available' },
            { label: 'Deployed', value: 'deployed' },
            { label: 'Reissue', value: 'reissue' },
            { label: 'Archived', value: 'archived' }
        ] },
    ]);

    console.log('Database seeded!');
    mongoose.connection.close();
};

seedDB().catch((err) => {
    console.error(err);
    mongoose.connection.close();
});