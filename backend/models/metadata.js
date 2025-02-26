const mongoose = require("mongoose");
const MetadataSchema = new mongoose.Schema({
	belongs_to:{
		type: String,
	},
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
		required: true,
	},
	additional:{
		type: Boolean,
		required: true,
		default: false
	},
	type: {
		type: String,
		enum: ["text","textarea","date","select","numeric"]
	},
	options:[
        {
            label: {
                type: String,
            },
            value:{
                type: String,
            }
        }
    ]
});
module.exports=mongoose.model("Metadata",MetadataSchema);