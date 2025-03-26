const redisClient = require("../config/redis"); // Assuming you have a redis client configured
const Permission = require("../models/permission"); // Assuming you have a database connection and models set up
const ApiError = require("../utils/ApiError");
 
const authorizeClient = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      // const userId = req.user.id; // Assuming user ID is available in the request object
      // console.log(req.body);
      const userRole = req.user.role;
      const redisKey = `${userRole}:permissions`;
 
      let permissions = await redisClient.get(redisKey);
 
      if (!permissions) {
        // Fetch permissions from the database
        const permissionDocument = await Permission.findOne({
          role: userRole,
        }).select("-__id -__v");
        permissions = permissionDocument.permissions;
        await redisClient.set(redisKey, JSON.stringify(permissions));
      } else {
        permissions = JSON.parse(permissions);
      }
 
      let permissionsEnabled = true;
 
      for (const permission of requiredPermissions) {
        if (!permissions.includes(permission)) {
          permissionsEnabled = false;
          break;
        }
      }
      // console.log(requiredPermissions);
      // console.log(permissions);
 
      if (permissionsEnabled) {
        return next();
      } else {
        throw new ApiError(403, null, "Forbidden Access");
      }
    } catch (error) {
      console.error("Authorization error:", error);
      // throw error;
      res.status(403).json({ message: "Forbidden Access" });
    }
  };
};
 
module.exports = authorizeClient;