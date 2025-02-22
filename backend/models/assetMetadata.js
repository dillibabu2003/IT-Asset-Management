const mongoose = require("mongoose");
const AssetMetadataSchema = new mongoose.Schema({
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
				enum: ["Available", "Deployed", "Archived", "Reissue"]
            },
            value:{
                type: String,
				enum: ["available", "deployed", "archived", "reissue"]
            }
        }
    ]
});
module.exports=mongoose.model("AssetMetadata",AssetMetadataSchema);