const mongoose = require('mongoose');
const Asset = require('../models/asset');
const Invoice = require('../models/invoice');
const License = require('../models/license');
const MetaData = require('../models/metadata');
const Permission = require('../models/permission');
const User = require('../models/user');
const UserVisibility = require('../models/userPreference');
const cleanedEnv = require('../utils/cleanedEnv');
const Dashboard = require('../models/dashboard');
const { roleEnum, statusEnum, genderEnum } = require('../utils/constants');
const Employee = require('../models/employee');

mongoose.connect(cleanedEnv.MONGO_URI, { 
    dbName: cleanedEnv.DB_NAME, 
    timeoutMS: 50000
});

const seedDB = async () => {
    await mongoose.connection.dropDatabase();

    const users = [];
    const roles = ['admin', 'member', 'guest'];
    let statuses = ['active', 'inactive', 'blocked'];
    const genders = ['male', 'female'];

    const user1 = new User({
        user_id: 'DBOXADMIN01',
        role: 'admin',
        firstname: 'dilli',
        lastname: 'babu',
        email: 'dilli@example.com',
        password: '1234',
        status: 'active',
        date_of_birth: new Date('1990-01-01'),
        gender: 'male',
    });

    const user2 = new User({
        user_id: 'DBOXMEMBER02',
        role: 'member',
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane@example.com',
        password: 'password456',
        date_of_birth: new Date('1992-02-02'),
        gender: 'female',
    });
    
    await user1.save();
    await user2.save();

    for (let i = 3; i <= 100; i++) {
        const role = roles[Math.floor(Math.random() * roles.length)];
        users.push(new User({
            user_id: i<10?`DBOX${role}${i.toString().padStart(1, '0')}`:`DBOX${role}${i}`,
            role: role,
            firstname: `FirstName${i}`,
            lastname: `LastName${i}`,
            email: `user${i}@example.com`,
            password: '1234',
            status: statuses[Math.floor(Math.random() * statuses.length)],
            date_of_birth: new Date(1960 + Math.floor(Math.random() * 40), 
                                  Math.floor(Math.random() * 12), 
                                  Math.floor(Math.random() * 28) + 1),
            gender: genders[Math.floor(Math.random() * genders.length)],
            profile_pic: "https://dbox-it-asset-management.s3.ap-south-1.amazonaws.com/profile-pics/default.png"
        }));
    }

    await User.insertMany(users);
    
    const employees =[];
    for (let i = 1; i <= 20; i++) {
        employees.push(new Employee({
            employee_id: `EMP${i.toString().padStart(3, '0')}`,
            firstname: `Employee${i}`,
            lastname: `LastName${i}`,
            email: `employee${i}@email.com`,
            department: 'IT',
            position: 'Software Engineer',
            joining_date: new Date(),
            phone_number: '123456789',
            status: 'active',
        }));
    }
    
    await Employee.insertMany(employees);

    const invoice1 = new Invoice({
        invoice_id: 'INV001',
        invoice_name: 'Invoice 1',
        date_of_upload: new Date(),
        date_of_received: new Date(),
        name_of_the_vendor: 'Vendor A',
        amount: 1000.00,
        status: 'processed',
        invoice_url: 'https://example.com/invoice1.pdf',
        data:{

        }
    });

    const invoice2 = new Invoice({
        invoice_id: 'INV002',
        invoice_name: 'Invoice 2',
        date_of_upload: new Date(),
        date_of_received: new Date(),
        name_of_the_vendor: 'Vendor A',
        amount: 1000.00,
        invoice_url: 'https://example.com/invoice2.pdf',
        status: 'processed',
        data:{}
    });

    const invoice3 = new Invoice({
        invoice_id: 'INV003',
        invoice_name: 'Invoice 3',
        date_of_upload: new Date(),
        date_of_received: new Date(),
        name_of_the_vendor: 'Vendor A',
        amount: 1000.00,
        invoice_url: 'https://example.com/invoice3.pdf',
        status: 'processed',
        data:{}
    });

    await invoice1.save();
    await invoice2.save();
    await invoice3.save();

    const assets = [];
    statuses = ["available", "deployed", "archived", "reissue", "about_to_archive"];
    for (let i = 1; i <= 20; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        assets.push(new Asset({
            serial_no: `SN${i.toString().padStart(3, '0')}`,
            asset_id: status!="available" ? `DBOX${i.toString().padStart(3, '0')}` : undefined,
            invoice_id: i%2==0?invoice1._id:invoice2._id,
            category: 'laptop',
            make: i % 2 === 0 ? 'Dell' : 'HP',
            model: i % 2 === 0 ? 'XPS 13' : 'Spectre x360',
            ram: i % 2 === 0 ? '16gb' : '8gb',
            storage: i % 2 === 0 ? '512gb' : '256gb',
            processor: i % 2 === 0 ? 'Intel i7' : 'Intel i5',
            os_type:  i % 2 === 0 ?'windows':'ubuntu',
            start: new Date(),
            end: new Date(Date.now()+1000*60*60*24*365),
            warranty: i % 2 === 0 ? '2 years' : '1 year',
            assigned_to: status !== 'available' ? i%2==0? employees[0]._id:employees[1]._id : null,
            status: status,
        }));
    }

    await Asset.insertMany(assets);

    const licenses = [];
    const licenseStatuses = ["available", "activated", "archived", "about_to_archive"];
    for (let i = 1; i <= 20; i++) {
        const status = licenseStatuses[Math.floor(Math.random() * licenseStatuses.length)];
        licenses.push(new License({
            serial_no: `SN${i.toString().padStart(3, '0')}`,
            license_id: status!="available" ? `DBOX${i.toString().padStart(3, '0')}` : undefined,
            invoice_id: i%2==0?invoice1._id:invoice2._id,
            category: i%2==0?"sophos":"microsoft",
            model: i % 2 === 0 ? 'Office 365' : 'Photoshop',
            start: new Date(),
            end: new Date(Date.now()+1000*60*60*24*365),
            warranty: i % 2 === 0 ? '1 year' : '2 years',
            status: status,
            assigned_to: status !== 'available' ? i%2==0? employees[0]._id:employees[1]._id : null,
        }));
    }

    await License.insertMany(licenses);

    const PermissionEnum = [
        "view:dashboard", "edit:dashboard",
        "view:employees", "edit:employees", "create:employees", "delete:employees",
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
            return !["edit:dashboard","edit:employees",'create:employees','delete:employees', "create:users", "edit:users", "delete:users"].includes(permission)
        })
    });

    const permission3 = new Permission({
        role: 'guest',
        permissions: PermissionEnum.filter(permission => { return permission.startsWith('view') })
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
                    "title": "Available Assets",
                    "matcher_field": "status",
                    "matcher_value": "available",
                    "func": "count",
                    "icon": "check-circle",
                    "color": "#4CAF50",
                    "query": "[{\"$match\":{\"status\":\"available\"}},{\"$count\":\"value\"}]",
                }
            ],
            elements: [
                {
                    "title": "Assets by status",
                    "type": "bar",
                    "fields": [
                        "status"
                    ],
                    "query": "[{\"$group\":{\"_id\":\"$status\",\"count\":{\"$sum\":1}}}]",
                },
                {
                    "title": "Recent Assets",
                    "type": "table",
                    "fields": [
                        "serial_no",
                        "asset_id",
                        "name_of_the_vendor",
                        "ram",
                        "storage",
                        "processor",
                        "model",
                        "status"
                    ],
                    "query": "[{\"$sort\":{\"updatedAt\":-1}},{\"$project\":{\"serial_no\":1,\"asset_id\":1,\"name_of_the_vendor\":1,\"ram\":1,\"storage\":1,\"processor\":1,\"model\":1,\"status\":1}},{\"$limit\":6}]",
                }
            ],
        },
        {
            id: "licenses",
            label: "Licenses Dashboard",
            tiles: [
                {
                    "title": "Active Licenses",
                    "matcher_field": "status",
                    "matcher_value": "activated",
                    "func": "count",
                    "icon": "key",
                    "color": "#FFC107",
                    "query": "[{\"$match\":{\"status\":\"activated\"}},{\"$count\":\"value\"}]",
                }
            ],
            elements: [
                {
                    "title": "Licenses by status",
                    "type": "pie",
                    "fields": [
                        "status"
                    ],
                    "query": "[{\"$group\":{\"_id\":\"$status\",\"count\":{\"$sum\":1}}}]",
                },
                {
                    "title": "Recent Licenses",
                    "type": "table",
                    "fields": [
                        "license_id",
                        "date_of_received",
                        "name_of_the_vendor",
                        "warranty",
                        "status"
                    ],
                    "query": "[{\"$sort\":{\"updatedAt\":-1}},{\"$project\":{\"license_id\":1,\"date_of_received\":1,\"name_of_the_vendor\":1,\"warranty\":1,\"status\":1}},{\"$limit\":6}]",
                }
            ],
        },
        {
            id: "invoices",
            label: "Invoices Dashboard",
            tiles: [
                {
                    "title": "Total Processed Invoices",
                    "matcher_field": "status",
                    "matcher_value": "processed",
                    "func": "count",
                    "icon": "key",
                    "color": "#F44336",
                    "query": "[{\"$match\":{\"status\":\"processed\"}},{\"$count\":\"value\"}]",
                },
                {
                    "title": "Total Amount of Pending Invoices",
                    "matcher_field": "status",
                    "matcher_value": "pending",
                    "func": "sum",
                    "target": "amount",
                    "icon": "check-circle",
                    "color": "#29ac20",
                    "query": "[{\"$match\":{\"status\":\"pending\"}},{\"$group\":{\"_id\":null,\"value\":{\"$sum\":{\"$toDecimal\":\"$amount\"}}}},{\"$project\":{\"_id\":0,\"value\":{\"$toString\":\"$value\"}}}]",
                }
            ],
            elements: [
                {
                    "title": "Invoices by status",
                    "type": "bar",
                    "fields": [
                        "status"
                    ],
                    "query": "[{\"$group\":{\"_id\":\"$status\",\"count\":{\"$sum\":1}}}]",
                },
                {
                    "title": "Recent Assets",
                    "type": "table",
                    "fields": [
                        "invoice_id",
                        "date_of_received",
                        "date_of_upload",
                        "name_of_the_vendor",
                        "amount",
                        "status"
                    ],
                    "query": "[{\"$sort\":{\"updatedAt\":-1}},{\"$project\":{\"invoice_id\":1,\"date_of_received\":1,\"date_of_upload\":1,\"name_of_the_vendor\":1,\"amount\":1,\"status\":1}},{\"$limit\":6}]",
                }
            ],
        }
    ];

    await Dashboard.insertMany(dashboards);

    await MetaData.insertMany([
        { belongs_to: "assets", id: 'serial_no', label: 'Serial No', type: 'text', required: true, additional: false, create: true, edit: false },
        { belongs_to: "assets", id: 'asset_id', label: 'Asset Id', type: 'text', required: false, additional: false, create: false, edit: false },
        { belongs_to: "assets", id: 'invoice_id', label: 'Invoice Id', type: 'text', required: true, additional: false, create: true, edit: false },
        { belongs_to: "assets", id: 'category', label: 'Category', type: 'select', 
            options: [
                {label: "Laptop", value: "laptop"},
                {label: "Desktop", value: "desktop"},
                {label: "Server", value: "server"},
                {label: "Printer", value: "printer"},
                {label: "Monitor", value: "monitor"},
                {label: "Mouse", value: "mouse"},
                {label: "Keyboard", value: "keyboard"}

            ],
            required: true, additional: false, create: true, edit: true },
        { belongs_to: "assets", id: 'make', label: 'Make', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "assets", id: 'model', label: 'Model', type: 'text', required: false, additional: false, create: true, edit: true },
        {
            belongs_to: "assets", id: 'ram', label: 'Ram', type: 'select', required: false, additional: false, create: true, edit: true, options: [
                { label: '8GB', value: '8gb' },
                { label: '16GB', value: '16gb' },
                { label: '32GB', value: '32gb' },
                { label: '64GB', value: '64gb' },
                { label: '128GB', value: '128gb' }
            ]
        },
        {
            belongs_to: "assets", id: 'storage', label: 'Storage', type: 'select', required: false, additional: false, create: true, edit: true, options: [
                { label: '256GB', value: '256gb' },
                { label: '512GB', value: '512gb' },
                { label: '1TB', value: '1tb' }
            ]
        },
        { belongs_to: "assets", id: 'processor', label: 'Processor', type: 'text', required: false, additional: false, create: true, edit: true },
        {
            belongs_to: "assets", id: 'os_type', label: 'Os Type', type: 'select', required: false, additional: false, create: true, edit: true, options: [
                { label: 'Ubuntu', value: 'ubuntu' },
                { label: 'Windows', value: 'windows' },
                { label: 'Mac', value: 'mac' }
            ]
        },
        { belongs_to: "assets", id: 'start', label: 'Start', type: 'date', required: true, additional: false, create: true, edit: true },
        { belongs_to: "assets", id: 'end', label: 'End', type: 'date', required: true, additional: false, create: true, edit: true },
        { belongs_to: "assets", id: 'warranty', label: 'Warranty', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "assets", id: 'assigned_to', label: 'Assigned To', type: 'text', required: false, additional: false, create: false, edit: false },
        {
            belongs_to: "assets", id: 'status', label: 'Status', type: 'select', required: true, additional: false, create: true, edit: false, options: [
                { label: 'Available', value: 'available' },
                { label: 'Deployed', value: 'deployed' },
                { label: 'Reissue', value: 'reissue' },
                { label: 'Archived', value: 'archived' },
                { label: 'About to Archive', value: 'about_to_archive' }
            ]
        },
    ]);
    await MetaData.insertMany([
        { belongs_to: "users", id: 'user_id', label: 'User ID', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "users", id: 'role', label: 'Role', type: 'select', required: true, additional: false, create: true, edit: true, options: roleEnum.map(role => ({ label: role.substring(0, 1).toUpperCase() + role.substring(1), value: role })) },
        { belongs_to: "users", id: 'firstname', label: 'First Name', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "users", id: 'lastname', label: 'Last Name', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "users", id: 'email', label: 'Email', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "users", id: 'password', label: 'Password', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "users", id: 'profile_pic', label: 'Profile Picture', type: 'image', required: false, additional: false, create: true, edit: true },
        { belongs_to: "users", id: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true, additional: false, create: true, edit: true },
        { belongs_to: "users", id: 'status', label: 'Status', type: 'select', required: false, additional: false, create: false, edit: true, options: statusEnum.map(status => ({ label: status.substring(0, 1).toUpperCase() + status.substring(1), value: status })) },
        { belongs_to: "users", id: 'gender', label: 'Gender', type: 'select', required: true, additional: false, create: true, edit: true, options: genderEnum.map(gender => ({ label: gender.substring(0, 1).toUpperCase() + gender.substring(1), value: gender })) },
    ]);

    await MetaData.insertMany([
        { belongs_to: "licenses", id: 'serial_no', label: 'Serial No', type: 'text', required: true, additional: false, create: true, edit: false },
        { belongs_to: "licenses", id: 'license_id', label: 'License ID', type: 'text', required: false, additional: false, create: false, edit: false },
        { belongs_to: "licenses", id: 'invoice_id', label: 'Invoice Id', type: 'text', required: true, additional: false, create: true, edit: false },
        { belongs_to: "licenses", id: 'category', label: 'Category', type: 'select',
            options: [
                { label: 'Sophos', value: 'sophos' },
                { label: 'Microsoft', value: 'microsoft' },
                {label: "Adobe", value: "adobe"},
                {label: "AutoDesk", value: "autodesk"},
                {label: "Grammarly", value: "grammarly"}

            ],
            required: true, additional: false, create: true, edit: true },
        { belongs_to: "licenses", id: 'assigned_to', label: 'Assigned To', type: 'text', required: false, additional: false, create: false, edit: false },
        { belongs_to: "licenses", id: 'model', label: 'Model', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "licenses", id: 'start', label: 'Start', type: 'date', required: true, additional: false, create: true, edit: true },
        { belongs_to: "licenses", id: 'end', label: 'End', type: 'date', required: true, additional: false, create: true, edit: true },
        { belongs_to: "licenses", id: 'warranty', label: 'Warranty', type: 'text', required: true, additional: false, create: true, edit: true },
        {
            belongs_to: "licenses", id: 'status', label: 'Status', type: 'select', required: true, additional: false, create: true, edit: false, options: [
                { label: 'Available', value: 'available' },
                { label: 'Activated', value: 'activated' },
                { label: 'Archived', value: 'archived' },
                { label: 'Reissue', value: 'reissue' },
                { label: 'About to archive', value: "about_to_archive" }
            ]
        },
    ]);
    await MetaData.insertMany([
        { belongs_to: "invoices", id: 'invoice_id', label: 'Invoice ID', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "invoices", id: 'invoice_name', label: 'Invoice Name', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "invoices", id: 'date_of_upload', label: 'Date Of Upload', type: 'date', required: true, additional: false, create: true, edit: true },
        { belongs_to: "invoices", id: 'date_of_received', label: 'Date Of Received', type: 'date', required: true, additional: false, create: true, edit: true },
        { belongs_to: "invoices", id: 'name_of_the_vendor', label: 'Name Of The Vendor', type: 'text', required: true, additional: false, create: true, edit: true },
        { belongs_to: "invoices", id: 'amount', label: 'Amount', type: 'numeric', required: true, additional: false, create: true, edit: true },
        { belongs_to: "invoices", id: 'invoice_url', label: 'Invoice URL', type: 'text', required: true, additional: false, create: true, edit: true },
        {
            belongs_to: "invoices", id: 'status', label: 'Status', type: 'select', required: true, additional: false, create: true, edit: true, options: [
                { label: 'Processed', value: 'processed' },
                { label: 'Pending', value: 'pending' },
                { label: 'Rejected', value: 'rejected' }
            ]
        },
        {
            belongs_to: "invoices", id: 'data', label: 'Data', type: 'object', required: true, additional: false, create: true, edit: true
        }
    ]);

    const userPreferences1 = new UserVisibility({
        user_id: user1._id,
        visible_fields: {
            assets: {
                "serial_no": true,
                "asset_id": true,
                "invoice_id": true,
                "category": true,
                "make": true,
                "model": true,
                "ram": true,
                "storage": true,
                "processor": true,
                "os_type": true,
                "start": true,
                "end": true,
                "warranty": true,
                "status": true,
                "assigned_to": true,
                "expiry": true,
                "date_of_received": true,
                "name_of_the_vendor": true,
            },
            licenses: {
                "serial_no": true,
                "license_id": true,
                "category": true,
                "invoice_id": true,
                "date_of_received": true,
                "name_of_the_vendor": true,
                "assigned_to": true,
                "model": true,
                "start": true,
                "end": true,
                "warranty": true,
                "status": true,
                "expiry": true,
            },
            invoices: {
                "invoice_id": true,
                "invoice_name": true,
                "date_of_upload": true,
                "date_of_received": true,
                "name_of_the_vendor": true,
                "amount": true,
                "status": true,
            },
        },
    });

    await userPreferences1.save();
    const userPreferences2 = new UserVisibility({
        user_id: user2._id,
        visible_fields: {
            assets: {
                "invoice_id": true,
                "checkout_id": true,
                "ram": true,
                "storage": true,
                "processor": true,
                "os_type": true,
                "start": true,
                "end": true,
                "warranty": true,
                "make": true,
                "model": true,
                "status": true,
                "serial_no": true,
                "asset_id": true,
                "date_of_received": true,
                "name_of_the_vendor": true,
            },
            licenses: {
                "license_id": true,
                "date_of_received": true,
                "name_of_the_vendor": true,
                "invoice_id": true,
                "make": true,
                "model": true,
                "start": true,
                "end": true,
                "warranty": true,
                "status": true,
            },
            invoices: {
                "invoice_id": true,
                "date_of_upload": true,
                "date_of_received": true,
                "name_of_the_vendor": true,
                "amount": true,
                "status": true,
            },
        },
    });

    await userPreferences2.save();
    console.log('Database seeded!');
    mongoose.connection.close();
};

seedDB().catch((err) => {
    console.error(err);
    mongoose.connection.close();
});