const mongoose = require("mongoose");

const DashboardSchema = new mongoose.Schema({
    id: {
        type: String,
        enum: ["assets","licenses","invoices","archives"],
        required: true,
    },
    label:{
        type: String,
        enum: ["Assets Dashboard","Licenses Dashboard","Invoices Dashboard","Archives Dashboard"],
        required: true,
    },
    tiles:[
        {
            title: {
                type: String,
                required: true,
            },
            matcher_field: {
                type: String,
                required: true,
            },
            matcher_value: {
                type: String,
            },
            func: {
                type: String,
                enum: ["sum","count","avg"],
                required: true,
            },
            target: {
                type: String,
            },
            icon: {
                type: String,
                required: true,
            },
            color: {
                type: String,
                required: true,
            },
            query: {
                type: String,
                required: true,
            }
        //   link: {
        //     type: String,
        //     required: true,
        //     },
        }
    ],
    elements:[
        {
            title:{
                type: String,
                required: true,
            },
            type:{
                type: String,
                enum: ["table","pie","bar","line"],
                required: true,
            },
            fields:[{
                type: String,
                required: true,
            }],
            query:{
                type: String,
                required: true,
            },
            // link:{
            //     type: String,
            //     required: true,
            // },

        }
    ]
});

module.exports = mongoose.model("Dashboard", DashboardSchema);
