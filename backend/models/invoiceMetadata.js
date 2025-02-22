const mongoose = require("mongoose");
const InvoiceMetaDataSchema = new mongoose.Schema({
    id: {
        type: String
    },
    label: {
        type: String,
        set() {
            const id = this.id;
            id.split("_").map((chunk)=>chunk.toUpperCase()).join(" ")
        },
    },
    required:{
        type: Boolean,
    },
    additional:{
        type: Boolean
    },
    type: {
        type: String,
        enum: ["text","textarea","date","select"]
    },
    options:[
        {
            label: {
                type: String,
                enum: ["Pending", "Rejected", "Processed"]
            },
            value:{
                type: String,
                enum: ["pending", "rejected", "processed"]
            }
        }
    ]
});
module.exports=mongoose.model("InvoiceMetadata",InvoiceMetaDataSchema);