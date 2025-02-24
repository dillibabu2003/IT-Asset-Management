const mongoose = require("mongoose");
const MetadataSchema = new mongoose.Schema({
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
            },
            value:{
                type: String,
            }
        }
    ]
});
module.exports=mongoose.model("Metadata",MetadataSchema);