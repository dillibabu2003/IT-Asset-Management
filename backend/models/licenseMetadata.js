const mongoose = require("mongoose");
const LicenseMetaDataSchema = new mongoose.Schema({
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
                enum: ["Available", "Activated", "Expired", "About to Expire"]
            },
            value:{
                type: String,
                enum: ["available", "activated", "expired", "about_to_expire"],
            }
        }
    ]
});
module.exports=mongoose.model("LicenseMetadata",LicenseMetaDataSchema);