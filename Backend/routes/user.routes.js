const express = require("express");
const router = express.Router();
const {body} = require("express-validator");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const {uploadUserImage} = require("../utils/upload.utils");


router.post("/register",
uploadUserImage, // Middleware to handle file upload
    [
    body("email").isEmail().withMessage("Invalid email"),
    body("fullname.firstname").isLength({min:3}).withMessage("First name must be at least 3 characters long"),
    body("password").isLength({min:5}).withMessage("Password must be at least 5 characters long")
],
userController.register
);

router.post("/login",[
    body("email").isEmail().withMessage("Invalid email"),   
    body("password").isLength({min:5}).withMessage("Password must be at least 5 characters long")
],
userController.login
);
router.post("/forgot-password",[
    body("email").isEmail().withMessage("Invalid email")
],
userController.forgotPassword
);
router.post("/reset-password/:token",[
    body("password").isLength({min:5}).withMessage("Password must be at least 5 characters long")
],
userController.resetPassword
);
router.get("/profile",authMiddleware.authUser, userController.getUserProfile);
router.post("/logout", authMiddleware.authUser, userController.logout);
router.post("/google-login", userController.googleLogin);

module.exports = router;