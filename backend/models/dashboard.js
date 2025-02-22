const mongoose = require("mongoose");

const DashboardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    tiles:[
        {
            title: {
                type: String,
                required: true,
            },
            reference_object: {
                type: String,
                enum: ["assets","licenses","checkouts","archives"],
                required: true,
            },
            type: {
                type: String,
                enum: ["single","multiple","compare"],
                required: true,
            },
            func: {
                type: String,
                enum: ["sum","count","average","max","min",],
                required: true,
            },
            field: {
                type: String,
                required: true,
            },
            icon: {
                type: String,
                required: true,
            },
            color: {
                type: String,
                required: true,
            },
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
            reference_object:{
                type: String,
                enum: ["assets","licenses","checkouts","archives"],
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
            color:{
                type: String,
                required: true,
            },
            icon:{
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
