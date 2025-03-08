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
        required: true
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
		enum: ["text","textarea","date","select","numeric","image","pdf","array","object","boolean","file","email","password","phone","url","time","datetime","color","month","week","range","hidden","search","tel","time","datetime-local","select-multiple"],
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
    ],
	create: {
		type: Boolean
	},
	edit: {
		type: Boolean
	}
});
module.exports=mongoose.model("Metadata",MetadataSchema);