const {Router} = require('express');
const authRouter = require('./auth');
const userRouter = require('./user');

const authenticateClient=require('../middlewares/authenticateClient');
const dashboardRouter = require('./dashboards');
const metadataRouter = require('./metadata');
const dynamicObjectRouter = require('./dynamic_object');
const servicesRouter = require('./services');
const employeeRouter = require('./employee');
const checkoutRouter = require('./checkout');
const invoiceRouter = require('./invoice');
const indexRouter = Router();

indexRouter.use("/auth",authRouter);
indexRouter.use("/user",authenticateClient,userRouter);
indexRouter.use("/dashboards",authenticateClient,dashboardRouter);
indexRouter.use("/objects",authenticateClient,dynamicObjectRouter);
indexRouter.use("/metadata",authenticateClient,metadataRouter);
indexRouter.use("/services",authenticateClient,servicesRouter);
indexRouter.use("/employees",authenticateClient,employeeRouter);
indexRouter.use("/checkout",authenticateClient,checkoutRouter);
indexRouter.use("/invoices",authenticateClient,invoiceRouter);

































const data = {
    "main": {
        "name": "Main Dashboard",
        "tiles": [
            {
                "name": "Total Assets",
                "icon": "archive",
                "value": 8890,
                "color": "#2e7d32"
            },
            {
                "name": "Total Licenses",
                "icon": "key",
                "value": 889,
                "color": "#ed6c02"
            },
            {
                "name": "Total Invoices",
                "icon": "receipt",
                "value": 8000,
                "color": "#d32f2f"
            }
        ],
        "elements": [
            {
                "name": "Asset Status",
                "id": 1,
                "type": "pie",
                "data": [
                    {
                        "name": "Available",
                        "y": 889,
                        "color": "#2e7d32"
                    },
                    {
                        "name": "Checked Out",
                        "y": 793,
                        "color": "#ed6c02"
                    },
                    {
                        "name": "Maintenance",
                        "y": 396,
                        "color": "#d32f2f"
                    },
                    {
                        "name": "Other",
                        "y": 265,
                        "color": "#757575"
                    }
                ]
            },
            {
                "id": 2,
                "name": "Recent Assets",
                "type": "table",
                "columns": ["name", "status", "category", "lastUpdated"],
                "data": [
                    { "name": "MacBook Pro M2", "status": "Available", "category": "Laptops", "lastUpdated": "2 hours ago" },
                    { "name": "iPhone 14 Pro", "status": "Checked Out", "category": "Phones", "lastUpdated": "5 hours ago" },
                    { "name": "Dell XPS 15", "status": "Maintenance", "category": "Laptops", "lastUpdated": "1 day ago" },
                    { "name": "iPad Pro 12.9", "status": "Available", "category": "Tablets", "lastUpdated": "2 days ago" }
                ]
            }
        ]
    },
    "dashboardassets": {
        "name": "Assets",
        "tiles": [
            {
                "name": "Total Assets",
                "value": 8890,
                "icon": "archive",
                "color": "#2e7d32"
            },
            {
                "name": "Total Available Assets",
                "value": 889,
                "icon": "check-circle",
                "color": "#2e7d32"
            },
            {
                "name": "Total Deployed Assets",
                "value": 8000,
                "icon": "send",
                "color": "#ed6c02"
            }
        ],
        "elements": [
            {
                "id": 1,
                "name": "Asset Status",
                "type": "bar",
                "data": [
                    {
                        "name": "Available",
                        "y": 889,
                        "color": "#2e7d32"
                    },
                    {
                        "name": "Checked Out",
                        "y": 793,
                        "color": "#ed6c02"
                    },
                    {
                        "name": "Maintenance",
                        "y": 396,
                        "color": "#d32f2f"
                    },
                    {
                        "name": "Other",
                        "y": 265,
                        "color": "#757575"
                    }
                ]
            },
            {
                "id": 2,
                "name": "Recent Assets",
                "type": "table",
                "columns": ["name", "status", "category", "lastUpdated"],
                "data": [
                    { "id": 1, "name": "MacBook Pro M2", "status": "Available", "category": "Laptops", "lastUpdated": "2 hours ago" },
                    { "id": 2, "name": "iPhone 14 Pro", "status": "Checked Out", "category": "Phones", "lastUpdated": "5 hours ago" },
                    { "id": 3, "name": "Dell XPS 15", "status": "Maintenance", "category": "Laptops", "lastUpdated": "1 day ago" },
                    { "id": 4, "name": "iPad Pro 12.9", "status": "Available", "category": "Tablets", "lastUpdated": "2 days ago" },
                    { "id": 5, "name": "iPad Pro 12.9", "status": "Available", "category": "Tablets", "lastUpdated": "2 days ago" },
                    { "id": 6, "name": "iPad Pro 12.9", "status": "Available", "category": "Tablets", "lastUpdated": "2 days ago" }
                ]
            }
        ]
    },
    "dashboardlicenses": {
        "name": "Licenses",
        "tiles": [
            {
                "name": "Total Licenses",
                "value": 8890,
                "icon": "key",
                "color": "#2e7d32"
            },
            {
                "name": "Total Available Licenses",
                "value": 8000,
                "icon": "check-circle",
                "color": "#2e7d32"
            },
            {
                "name": "Total Expired Licenses",
                "value": 889,
                "icon": "message-circle-x",
                "color": "#d32f2f"
            }
        ],
        "elements": [
            {
                "id": 1,
                "name": "License Status",
                "type": "pie",
                "data": [
                    {
                        "name": "Available",
                        "y": 8000,
                        "color": "#2e7d32"
                    },
                    {
                        "name": "Expired",
                        "y": 793,
                        "color": "#ed6c02"
                    },
                    {
                        "name": "Activated",
                        "y": 396,
                        "color": "#d32f2f"
                    },
                    {
                        "name": "About to expire",
                        "y": 26,
                        "color": "#757575"
                    }
                ]
            },
            {
                "id": 2,
                "name": "Recent Licenses",
                "type": "table",
                "columns": ["name", "status", "lastUpdated"],
                "data": [
                    { "id": 1, "name": "Sophos", "status": "Expired", "lastUpdated": "2 hours ago" },
                    { "id": 2, "name": "Grammarly", "status": "Available", "lastUpdated": "5 hours ago" },
                    { "id": 3, "name": "Sophos", "status": "Activated", "lastUpdated": "1 day ago" }
                ]
            }
        ]
    },
    "dashboardinvoices": {
        "name": "Invoices",
        "tiles": [
            {
                "name": "Total Invoices",
                "value": 8890,
                "icon": "receipt",
                "color": "#2e7d32"
            },
            {
                "name": "Total Amount",
                "value": 80000,
                "icon": "wallet",
                "color": "#ed6c02"
            }
        ],
        "elements": [
            {
                "id": 1,
                "name": "Invoices",
                "type": "bar",
                "data": [
                    {
                        "name": "Total Invoices Per Year",
                        "y": 8000,
                        "color": "#2e7d32"
                    },
                    {
                        "name": "Expired",
                        "y": 793,
                        "color": "#ed6c02"
                    },
                    {
                        "name": "Activated",
                        "y": 396,
                        "color": "#d32f2f"
                    },
                    {
                        "name": "About to expire",
                        "y": 26,
                        "color": "#757575"
                    }
                ]
            }
        ]
    },
    "configure": {
        "main": {
            "name": "Default or Main Dashboard",
            "tiles": [
                {
                    "name": "Assets",
                    "content": {
                        "type": "single",
                        "func": "count",
                        "field": "serial-number"
                    }
                },
                {
                    "name": "Licenses",
                    "refernce-object": "licenses",
                    "content": {
                        "type": "compare",
                        "func": "count",
                        "field": {
                            "expired": true
                        }
                    }
                },
                {
                    "name": "Invoices",
                    "refernce-object": "invoices",
                    "content": {
                        "type": "single",
                        "func": "sum",
                        "field": "amount"
                    }
                }
            ],
            "elements": null
        }
    },
    "assets": {
        "name": "Assets",
        "fields": [
            {
                "note": "in backend convert name to snake case",
                "id": "serial_number",
                "label": "Serial Number",
                "visible": true,
                "type": "text",
                "required": true,
                "create": true,
                "update": false,
                "delete": false
            },
            {
                "id": "name",
                "label": "Name",
                "visible": true,
                "type": "text",
                "required": true,
                "create": true,
                "update": true,
                "delete": false
            },
            {
                "id": "status",
                "label": "Status",
                "visible": true,
                "type": "select",
                "create": true,
                "update": true,
                "delete": false,
                "options": [
                    {
                        "label": "Available",
                        "value": "available"
                    },
                    {
                        "label": "Checked Out",
                        "value": "checked_out"
                    },
                    {
                        "label": "Maintenance",
                        "value": "maintenance"
                    },
                    {
                        "label": "Other",
                        "value": "other"
                    }
                ],
                "required": true
            },
            {
                "id": "category",
                "label": "Category",
                "visible": true,
                "type": "select",
                "create": true,
                "update": true,
                "delete": false,
                "options": [
                    {
                        "label": "Monitor",
                        "value": "monitor"
                    },
                    {
                        "label": "Laptop",
                        "value": "laptop"
                    },
                    {
                "create": false,
                "update": false,
                "delete": false,
                "required": true
            }]}
        ],
        "documents": [
            {
                "note": "here send the id of serial number",
                "serial_number": 1,
                "name": "Mac",
                "status": "Available",
                "category": "Laptop",
                "lastUpdated": "2 days ago"
            },
            {
                "serial_number": 2,
                "name": "Mac",
                "status": "Available",
                "category": "Laptop",
                "lastUpdated": "2 days ago"
            },
            {
                "serial_number": 3,
                "name": "Dell Monitor",
                "status": "Checked Out",
                "category": "Monitor",
                "lastUpdated": "1 day ago"
            },
            {
                "serial_number": 4,
                "name": "Logitech Mouse",
                "status": "Available",
                "category": "Mouse",
                "lastUpdated": "3 days ago"
            },
            {
                "serial_number": 5,
                "name": "HP Laptop",
                "status": "Maintenance",
                "category": "Laptop",
                "lastUpdated": "4 days ago"
            },
            {
                "serial_number": 6,
                "name": "HP Printer",
                "status": "Available",
                "category": "Printer",
                "lastUpdated": "5 days ago"
            },
            {
                "serial_number": 7,
                "name": "Samsung Monitor",
                "status": "Checked Out",
                "category": "Monitor",
                "lastUpdated": "6 days ago"
            },
            {
                "serial_number": 8,
                "name": "Apple Keyboard",
                "status": "Available",
                "category": "Keyboard",
                "lastUpdated": "7 days ago"
            },
            {
                "serial_number": 9,
                "name": "Dell Laptop",
                "status": "Maintenance",
                "category": "Laptop",
                "lastUpdated": "8 days ago"
            },
            {
                "serial_number": 10,
                "name": "HP Mouse",
                "status": "Available",
                "category": "Mouse",
                "lastUpdated": "9 days ago"
            },
            {
                "serial_number": 11,
                "name": "Lenovo Laptop",
                "status": "Checked Out",
                "category": "Laptop",
                "lastUpdated": "10 days ago"
            },
            {
                "serial_number": 12,
                "name": "Asus Monitor",
                "status": "Available",
                "category": "Monitor",
                "lastUpdated": "11 days ago"
            },
            {
                "serial_number": 13,
                "name": "Microsoft Surface",
                "status": "Maintenance",
                "category": "Laptop",
                "lastUpdated": "12 days ago"
            },
            {
                "serial_number": 14,
                "name": "Logitech Webcam",
                "status": "Available",
                "category": "Webcam",
                "lastUpdated": "13 days ago"
            },
            {
                "serial_number": 15,
                "name": "HP Docking Station",
                "status": "Checked Out",
                "category": "Docking Station",
                "lastUpdated": "14 days ago"
            },
            {
                "serial_number": 16,
                "name": "Dell Keyboard",
                "status": "Available",
                "category": "Keyboard",
                "lastUpdated": "15 days ago"
            },
            {
                "serial_number": 17,
                "name": "Apple Mouse",
                "status": "Maintenance",
                "category": "Mouse",
                "lastUpdated": "16 days ago"
            },
            {
                "serial_number": 18,
                "name": "Samsung Tablet",
                "status": "Available",
                "category": "Tablet",
                "lastUpdated": "17 days ago"
            },
            {
                "serial_number": 19,
                "name": "HP Laptop",
                "status": "Checked Out",
                "category": "Laptop",
                "lastUpdated": "18 days ago"
            },
            {
                "serial_number": 20,
                "name": "Dell Monitor",
                "status": "Available",
                "category": "Monitor",
                "lastUpdated": "19 days ago"
            }
        ],
        "total": 20
        },
    "licenses": {
        "name": "Licenses",
        "fields": [
            {
                "id": "license_key",
                "label": "License Key",
                "type": "text",
                "required": true,
                "visible": true,
                "create": true,
                "update": false,
                "delete": false
            },
            {
                "id": "name",
                "label": "Name",
                "type": "text",
                "required": true,
                "visible": true,
                "create": true,
                "update": true,
                "delete": false
            },
            {
                "id": "status",
                "label": "Status",
                "type": "select",
                "options": [
                    {
                        "label": "Available",
                        "value":"available"
                    },
                    {
                        "label": "Expired",
                        "value": "expired"
                    },
                    {
                        "label": "Activated",
                        "value": "activated"
                    }
                ],
                "required": true,
                "visible": true,
                "create": true,
                "update": true,
                "delete": false
            },
            {
                "id": "lastUpdated",
                "label": "Last Updated",
                "type": "date",
                "required": true,
                "visible": true,
                "create": false,
                "update": false,
                "delete": false
            }
        ],
        "documents": [
            {
                "license_key": 1,
                "name": "Sophos",
                "status": "Expired",
                "lastUpdated": "2 hours ago"
            },
            {
                "license_key": 2,
                "name": "Grammarly",
                "status": "Available",
                "lastUpdated": "5 hours ago"
            },
            {
                "license_key": 3,
                "name": "Microsoft Office",
                "status": "Activated",
                "lastUpdated": "1 day ago"
            },
            {
                "license_key": 4,
                "name": "Adobe Photoshop",
                "status": "Available",
                "lastUpdated": "2 days ago"
            },
            {
                "license_key": 6,
                "name": "Visual Studio",
                "status": "Available",
                "lastUpdated": "4 days ago"
            },
            {
                "license_key": 7,
                "name": "IntelliJ IDEA",
                "status": "Activated",
                "lastUpdated": "5 days ago"
            },
            {
                "license_key": 8,
                "name": "PyCharm",
                "status": "Available",
                "lastUpdated": "6 days ago"
            },
            {
                "license_key": 9,
                "name": "WebStorm",
                "status": "Expired",
                "lastUpdated": "7 days ago"
            },
            {
                "license_key": 10,
                "name": "DataGrip",
                "status": "Available",
                "lastUpdated": "8 days ago"
            },
            {
                "license_key": 11,
                "name": "Slack",
                "status": "Available",
                "lastUpdated": "9 days ago"
            },
            {
                "license_key": 12,
                "name": "Zoom",
                "status": "Activated",
                "lastUpdated": "10 days ago"
            },
            {
                "license_key": 13,
                "name": "Dropbox",
                "status": "Expired",
                "lastUpdated": "11 days ago"
            },
            {
                "license_key": 14,
                "name": "Google Drive",
                "status": "Available",
                "lastUpdated": "12 days ago"
            },
            {
                "license_key": 15,
                "name": "OneDrive",
                "status": "Activated",
                "lastUpdated": "13 days ago"
            },
            {
                "license_key": 16,
                "name": "GitHub",
                "status": "Available",
                "lastUpdated": "14 days ago"
            },
            {
                "license_key": 17,
                "name": "Bitbucket",
                "status": "Expired",
                "lastUpdated": "15 days ago"
            },
            {
                "license_key": 18,
                "name": "Jira",
                "status": "Available",
                "lastUpdated": "16 days ago"
            },
            {
                "license_key": 19,
                "name": "Confluence",
                "status": "Activated",
                "lastUpdated": "17 days ago"
            },
            {
                "license_key": 20,
                "name": "Trello",
                "status": "Available",
                "lastUpdated": "18 days ago"
            }
        ],
        "total": 20
    }
}
indexRouter.get("/dashboard/assets", (req, res) => {
    
    console.log("Hitting api");
    res.status(200).json({ ...data.dashboardassets});
})
indexRouter.get("/dashboard/licenses", (req, res) => {
    
    console.log("Hitting api");

    res.status(200).json({ ...data.dashboardlicenses });
})
indexRouter.get("/dashboard/invoices", (req, res) => {
    console.log("Hitting api");

    res.status(200).json({ ...data.dashboardinvoices });
})
indexRouter.get("/assets", (req, res) => {
    const { page, limit } = req.query;
    console.log("Hitting api");

    res.status(200).json({ ...data.assets, documents: data.assets.documents.slice((page - 1) * limit, (page - 1) * limit + limit) });
})
indexRouter.get("/licenses", (req, res) => {
    const { page, limit } = req.query;
    console.log("Hitting licenses api");

    res.status(200).json({ ...data.licenses, documents: data.licenses.documents.slice((page - 1) * limit, (page - 1) * limit + limit) });
})
module.exports=indexRouter;