const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  authMiddleware,
  forgotPassword,
  resetPassword,
  registerIncognitoUser,
  getIncognitoUsers,
  loginAsIncognitoUser,
  loginAsMainUser,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/register-incognito", authMiddleware, registerIncognitoUser);
router.get("/incognito-users", authMiddleware, getIncognitoUsers);
router.post("/login-as-incognito", authMiddleware, loginAsIncognitoUser);
router.post("/login-as-main", authMiddleware, loginAsMainUser);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});

module.exports = router;
