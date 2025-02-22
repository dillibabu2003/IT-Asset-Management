const mongoose = require('mongoose');
const Asset = require('./models/asset');
const AssetMetadata = require('./models/assetMetadata');
const Checkout = require('./models/checkOut');
const CheckOutItem = require('./models/checkOutItem');
const CheckoutMetadata = require('./models/checkoutMetadata');
const Invoice = require('./models/invoice');
const InvoiceMetadata = require('./models/invoiceMetadata');
const License = require('./models/license');
const LicenseMetadata = require('./models/licenseMetadata');
const Permission = require('./models/permission');
const User = require('./models/user');
const UserVisibility = require('./models/userPreference');

mongoose.connect('mongodb://localhost:27017/it-asset-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const seedDB = async () => {
    await mongoose.connection.dropDatabase();

    const user1 = new User({
        user_id: 'U001',
        role: 'admin',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        date_of_birth: new Date('1990-01-01'),
        gender: 'male',
    });

    const user2 = new User({
        user_id: 'U002',
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

    const checkout1 = new Checkout({
        checkout_id: 'CO001',
        checkedout_items: [
            {
                type: 'asset',
                qty: 1,
            },
        ],
        date_of_checkout: new Date(),
        status: 'processed',
    });

    await checkout1.save();

    const checkoutItem1 = new CheckOutItem({
        checkout_id: checkout1._id,
        item_id: asset1._id,
        item_type: 'Assets',
        date_of_checkout: new Date(),
    });

    await checkoutItem1.save();

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

    const permission1 = new Permission({
        role: 'admin',
        permissions: {
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

    const userVisibility1 = new UserVisibility({
        user_id: user1._id,
        visible_fields: {
            assets: ['serial_no', 'asset_id', 'status'],
            licenses: ['license_id', 'status'],
        },
    });

    await userVisibility1.save();

    const assetMetadata = new AssetMetadata({
        fields: [
            { id: 'serial_no', label: 'Serial No', type: 'text' },
            { id: 'asset_id', label: 'Asset Id', type: 'text' },
            { id: 'date_of_received', label: 'Date Of Received', type: 'date' },
            { id: 'name_of_the_vendor', label: 'Name Of The Vendor', type: 'text' },
            { id: 'invoice_id', label: 'Invoice Id', type: 'text' },
            { id: 'make', label: 'Make', type: 'text' },
            { id: 'model', label: 'Model', type: 'text' },
            { id: 'ram', label: 'Ram', type: 'text' },
            { id: 'storage', label: 'Storage', type: 'text' },
            { id: 'processor', label: 'Processor', type: 'text' },
            { id: 'os_type', label: 'Os Type', type: 'text' },
            { id: 'start', label: 'Start', type: 'date' },
            { id: 'end', label: 'End', type: 'date' },
            { id: 'warranty', label: 'Warranty', type: 'text' },
            { id: 'status', label: 'Status', type: 'select', options: [{ label: 'Available', value: 'available' }, { label: 'Unavailable', value: 'unavailable' }] },
        ],
    });

    await assetMetadata.save();

    const checkoutMetadata = new CheckoutMetadata({
        fields: [
            { id: 'checkout_id', label: 'Checkout Id', type: 'text' },
            { id: 'checkedout_items', label: 'Checkedout Items', type: 'textarea' },
            { id: 'date_of_checkout', label: 'Date Of Checkout', type: 'date' },
            { id: 'status', label: 'Status', type: 'select', options: [{ label: 'Processed', value: 'processed' }, { label: 'Pending', value: 'pending' }] },
        ],
    });

    await checkoutMetadata.save();

    const invoiceMetadata = new InvoiceMetadata({
        fields: [
            { id: 'invoice_id', label: 'Invoice Id', type: 'text' },
            { id: 'date_of_upload', label: 'Date Of Upload', type: 'date' },
            { id: 'date_of_received', label: 'Date Of Received', type: 'date' },
            { id: 'name_of_the_vendor', label: 'Name Of The Vendor', type: 'text' },
            { id: 'amount', label: 'Amount', type: 'text' },
            { id: 'status', label: 'Status', type: 'select', options: [{ label: 'Processed', value: 'processed' }, { label: 'Pending', value: 'pending' }] },
        ],
    });

    await invoiceMetadata.save();

    const licenseMetadata = new LicenseMetadata({
        fields: [
            { id: 'license_id', label: 'License Id', type: 'text' },
            { id: 'date_of_received', label: 'Date Of Received', type: 'date' },
            { id: 'name_of_the_vendor', label: 'Name Of The Vendor', type: 'text' },
            { id: 'invoice_id', label: 'Invoice Id', type: 'text' },
            { id: 'make', label: 'Make', type: 'text' },
            { id: 'model', label: 'Model', type: 'text' },
            { id: 'start', label: 'Start', type: 'date' },
            { id: 'end', label: 'End', type: 'date' },
            { id: 'warranty', label: 'Warranty', type: 'text' },
            { id: 'status', label: 'Status', type: 'select', options: [{ label: 'Available', value: 'available' }, { label: 'Unavailable', value: 'unavailable' }] },
        ],
    });

    await licenseMetadata.save();

    console.log('Database seeded!');
    mongoose.connection.close();
};

seedDB().catch((err) => {
    console.error(err);
    mongoose.connection.close();
});