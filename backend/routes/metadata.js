const {Router}=require('express');
import { getMetaData,addMetaData } from '../controllers/metadata';
const metaDataRouter=Router();
metaDataRouter.get("/:belong_to",getMetaData);
metaDataRouter.post("/:belong_to",addMetaData);
module.exports=metaDataRouter;
