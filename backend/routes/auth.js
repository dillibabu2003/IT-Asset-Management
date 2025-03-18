const { Router } = require("express");

const {
  handleLogin,
  handleLogout,
  handleRefreshAccessToken,
  handleForgotPassword,
  handleResetPassword,
  handleVerifyEmail,
} = require("../controllers/auth");

const authRouter = Router();
authRouter.post("/login", handleLogin);
authRouter.get("/logout", handleLogout);
authRouter.post("/refresh-access-token", handleRefreshAccessToken);
authRouter.post("/forgot-password", handleForgotPassword);
authRouter.patch("/forgot-password", handleResetPassword);
authRouter.get("/verify-email/:id", handleVerifyEmail);
module.exports = authRouter;
