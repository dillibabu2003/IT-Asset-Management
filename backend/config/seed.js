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
const Dashboard = require('../models/dashboard');
const { roleEnum, statusEnum, genderEnum } = require('../utils/constants');
const { query } = require('express');

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
    const user2 = new User({
        user_id: 'U002',
        role: 'guest',
        firstname: 'dilli',
        lastname: 'babu',
        email: 'dilli@example.com',
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
    await user2.save();

    const invoice1 = new Invoice({
        invoice_id: 'INV001',
        date_of_upload: new Date(),
        date_of_received: new Date(),
        name_of_the_vendor: 'Vendor A',
        amount: 1000.00,
        status: 'processed',
    });

    await invoice1.save();

    const asset1 = new Asset({
        serial_no: 'SN001',
        asset_id: 'A001',
        date_of_received: new Date(),
        name_of_the_vendor: 'Vendor A',
        invoice_id: invoice1._id,
        make: 'Dell',
        model: 'XPS 13',
        ram: '16GB',
        storage: '512GB',
        processor: 'Intel i7',
        os_type: 'windows',
        start: new Date(),
        end: new Date(),
        warranty: '2 years',
        status: 'available',
    });

    await asset1.save();
    const asset2 = new Asset({
        serial_no: 'SN002',
        asset_id: 'A002',
        date_of_received: new Date(),
        name_of_the_vendor: 'Vendor B',
        invoice_id: invoice1._id,
        make: 'HP',
        model: 'Spectre x360',
        ram: '8GB',
        storage: '256GB',
        processor: 'Intel i5',
        os_type: 'windows',
        start: new Date(),
        end: new Date(),
        warranty: '1 year',
        status: 'available',
    });

    await asset2.save();

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

    const license1 = new License({
        license_id: 'LIC001',
        date_of_received: new Date(),
        name_of_the_vendor: 'Vendor B',
        invoice_id: invoice1._id,
        make: 'Microsoft',
        model: 'Office 365',
        start: new Date(),
        end: new Date(),
        warranty: '1 year',
        status: 'available',
    });

    await license1.save();

    const invoice2 = new Invoice({
        invoice_id: 'INV002',
        date_of_upload: new Date(),
        date_of_received: new Date(),
        name_of_the_vendor: 'Vendor B',
        amount: 2000.00,
        status: 'pending',
    });

    const invoice3 = new Invoice({
        invoice_id: 'INV003',
        date_of_upload: new Date(),
        date_of_received: new Date(),
        name_of_the_vendor: 'Vendor C',
        amount: 1500.00,
        status: 'processed',
    });

    await invoice2.save();
    await invoice3.save();

    const PermissionEnum = [
        "view:dashboard","edit:dashboard",
        "view:invoices:dashboard", "view:licenses:dashboard", "view:assets:dashboard", "view:users", "view:assets", "view:licenses", "view:invoices", "view:checkouts",
        "edit:invoices:dashboard", "edit:licenses:dashboard", "edit:assets:dashboard", "edit:users", "edit:assets", "edit:licenses", "edit:invoices", "edit:checkouts",
        "create:invoices:dashboard", "create:licenses:dashboard", "create:assets:dashboard", "create:users", "create:assets", "create:licenses", "create:invoices", "create:checkouts",
        "delete:invoices:dashboard", "delete:licenses:dashboard", "delete:assets:dashboard", "delete:users", "delete:assets", "delete:licenses", "delete:invoices", "delete:checkouts",
    ];

    const permission1 = new Permission({
        role: 'admin',
        permissions: PermissionEnum
    });

    const permission2 = new Permission({
        role: 'member',
        permissions: PermissionEnum.filter(permission => {
            return !["edit:dashboard","create:users","edit:users","delete:users"].includes(permission)
        })
    });

    const permission3 = new Permission({
        role: 'guest',
        permissions: PermissionEnum.filter(permission => { return permission.startsWith('view')})
    });
    

    await permission1.save();
    await permission2.save();
    await permission3.save();

    const dashboards = [
        {
            id: "assets",
            label: "Assets Dashboard",
            tiles: [
                {
                    title: "Available Assets",
                    func: "count",
                    matcher_field: "status",
                    matcher_value: "available",
                    icon: "check-circle",
                    color: "#4CAF50", 
                    query: 'some query' 
                },
            ],
            elements: [
                {
                    title: "Assets by status",
                    type: "bar",
                    fields: ["status"],
                    color: "#2196F3", // Changed to a hex value
                    icon: "package",
                    query: 'some query'
                },
            ],
        },
    {
        id: "licenses",
        label: "Licenses Dashboard",
        tiles: [
        {
            title: "Active Licenses",
            func: "count",
            matcher_field: "status",
            matcher_value: "active",
            icon: "key",
            color: "#FFC107", 
            query: 'some query'
        },
        ],
        elements: [
        {
            title: "Licenses by status",
            type: "pie",
            fields: ["status"],
            query: 'some query'
        },
        ],
    },
    {
        id: "invoices",
        label: "Invoices Dashboard",
        tiles: [
        {
            title: "Processed Invoices",
            func: "count",
            matcher_field: "status",
            matcher_value: "processed",
            icon: "file-invoice",
            color: "#F44336", // Changed to a hex value
            query: 'some query'
        },
        ],
        elements: [
        {
            title: "Invoices by status",
            type: "line",
            fields: ["status"],
            query: 'some query'
        },
        ],
    }
    ];

    await Dashboard.insertMany(dashboards);



    const userVisibility = new UserVisibility({
        user_id: user1._id,
        visible_fields: {
            assets: ['make', 'model', 'status'],
            licenses: ['license_id', 'name_of_the_vendor'],
        },
    });

    await userVisibility.save();

    await MetaData.insertMany([
        { belongs_to: "assets", id: 'serial_no', label: 'Serial No', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "assets", id: 'asset_id', label: 'Asset Id', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "assets", id: 'date_of_received', label: 'Date Of Received', type: 'date', required: true, additional: false, create: true, edit: true },
        { belongs_to: "assets", id: 'name_of_the_vendor', label: 'Name Of The Vendor', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "assets", id: 'invoice_id', label: 'Invoice Id', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "assets", id: 'make', label: 'Make', type: 'text', required: false, additional: false, create: true, edit: true },
        { belongs_to: "assets", id: 'model', label: 'Model', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "assets", id: 'ram', label: 'Ram', type: 'select', required: false, additional: false, create: true, edit: true,options: [
            { label: '8GB', value: '8GB' },
            { label: '16GB', value: '16GB' },
            { label: '32GB', value: '32GB' },
            { label: '64GB', value: '64GB' },
            { label: '128GB', value: '128GB' }
        ] },
        { belongs_to: "assets", id: 'storage', label: 'Storage', type: 'select', required: false, additional: false, create: true, edit: true, options: [
            { label: '256GB', value: '256GB' },
            { label: '512GB', value: '512GB' },
            { label: '1TB', value: '1TB' }
        ] },
        { belongs_to: "assets", id: 'processor', label: 'Processor', type: 'text', required: false, additional: false, create: true, edit: true },
        { belongs_to: "assets", id: 'os_type', label: 'Os Type', type: 'select', required: false, additional: false, create: true, edit: true, options: [
            { label: 'Ubuntu', value: 'ubuntu' },
            { label: 'Windows', value: 'windows' },
            { label: 'Mac', value: 'mac' }
        ] },
        { belongs_to: "assets", id: 'start', label: 'Start', type: 'date', required: true, additional: false, create: true, edit: true },
        { belongs_to: "assets", id: 'end', label: 'End', type: 'date', required: true, additional: false, create: true, edit: true },
        { belongs_to: "assets", id: 'warranty', label: 'Warranty', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "assets", id: 'status', label: 'Status', type: 'select', required: true, additional: false, create: true, edit: true, options: [
            { label: 'Available', value: 'available' },
            { label: 'Deployed', value: 'deployed' },
            { label: 'Reissue', value: 'reissue' },
            { label: 'Archived', value: 'archived' }
        ] },
    ]);
    await MetaData.insertMany([
        { belongs_to: "users", id: 'user_id', label: 'User ID', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "users", id: 'role', label: 'Role', type: 'select', required: true, additional: false, create: true, edit: true, options: roleEnum.map(role => ({ label: role.substring(0,1).toUpperCase()+role.substring(1), value: role })) },
        { belongs_to: "users", id: 'firstname', label: 'First Name', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "users", id: 'lastname', label: 'Last Name', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "users", id: 'email', label: 'Email', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "users", id: 'password', label: 'Password', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "users", id: 'profile_pic', label: 'Profile Picture', type: 'image', required: false, additional: false, create: true, edit: true },
        { belongs_to: "users", id: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true, additional: false, create: true, edit: true },
        { belongs_to: "users", id: 'status', label: 'Status', type: 'select', required: false, additional: false, create: false, edit: true, options: statusEnum.map(status => ({ label: status.substring(0,1).toUpperCase()+status.substring(1), value: status })) },
        { belongs_to: "users", id: 'gender', label: 'Gender', type: 'select', required: true, additional: false, create: true, edit: true, options: genderEnum.map(gender => ({ label: gender.substring(0,1).toUpperCase()+gender.substring(1), value: gender })) },
    ]);

    await MetaData.insertMany([
        { belongs_to: "licenses", id: 'license_id', label: 'License ID', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "licenses", id: 'date_of_received', label: 'Date Of Received', type: 'date', required: true, additional: false, create: true, edit: true },
        { belongs_to: "licenses", id: 'name_of_the_vendor', label: 'Name Of The Vendor', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "licenses", id: 'invoice_id', label: 'Invoice Id', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "licenses", id: 'make', label: 'Make', type: 'text', required: false, additional: false, create: true, edit: true },
        { belongs_to: "licenses", id: 'model', label: 'Model', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "licenses", id: 'start', label: 'Start', type: 'date', required: true, additional: false, create: true, edit: true },
        { belongs_to: "licenses", id: 'end', label: 'End', type: 'date', required: true, additional: false, create: true, edit: true },
        { belongs_to: "licenses", id: 'warranty', label: 'Warranty', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "licenses", id: 'status', label: 'Status', type: 'select', required: true, additional: false, create: true, edit: true, options: [
            { label: 'Available', value: 'available' },
            { label: 'Expired', value: 'expired' },
            { label: 'Renewed', value: 'renewed' }
        ] },
    ]);
    await MetaData.insertMany([
        { belongs_to: "invoices", id: 'invoice_id', label: 'Invoice ID', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "invoices", id: 'date_of_upload', label: 'Date Of Upload', type: 'date', required: true, additional: false, create: true, edit: true },
        { belongs_to: "invoices", id: 'date_of_received', label: 'Date Of Received', type: 'date', required: true, additional: false, create: true, edit: true },
        { belongs_to: "invoices", id: 'name_of_the_vendor', label: 'Name Of The Vendor', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "invoices", id: 'amount', label: 'Amount', type: 'numeric', required: true, additional: false, create: true, edit: true },
        { belongs_to: "invoices", id: 'status', label: 'Status', type: 'select', required: true, additional: false, create: true, edit: true, options: [
            { label: 'Processed', value: 'processed' },
            { label: 'Pending', value: 'pending' },
            { label: 'Cancelled', value: 'cancelled' }
        ] },
    ]);
    console.log('Database seeded!');
    mongoose.connection.close();
};

seedDB().catch((err) => {
    console.error(err);
    mongoose.connection.close();
});