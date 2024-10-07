const express = require("express");
const router = express.Router();

//controller
const {
  register,
  login,
  getCurrentUser,
  update,
} = require("../controllers/UserController");

//middlewares
const validate = require("../middlewares/handleValidation");
const {
  userCreateValidation,
  loginValidation,
  userUpdateValidation,
} = require("../middlewares/userValidations.js");
const authGuard = require("../middlewares/authGuard.js");
const { imageUpload } = require("../middlewares/imageUpload.js");

// routes
router.post("/register", userCreateValidation(), validate, register);
router.post("/login", loginValidation(), validate, login);
router.get("/profile", authGuard, getCurrentUser);
router.put(
  "/",
  authGuard,
  userUpdateValidation(),
  validate,
  imageUpload.single("profileImage"),
  update
);

module.exports = router;