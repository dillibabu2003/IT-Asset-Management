const { Router } = require("express");
const { getMetaData } = require("../controllers/metadata");
const authorizeClient = require("../middlewares/authorizeClient");
const metaDataRouter = Router();
metaDataRouter.get(
  "/:belongs_to",
  (req, res, next) => {
    authorizeClient([`view:${req.params.belongs_to}`])(req, res, next);
  },
  getMetaData,
);
module.exports = metaDataRouter;
