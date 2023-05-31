const express = require("express");
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const {
  verifyToken,
  verifySupport,
  verifyAdmin,
} = require("../middleware/verifyToken");
const {
  postRegister,
  postLogin,
  postLogout,
  getLogout,
} = require("../controllers/authController");

const router = express();

//REGISTER
router.post(
  "/register",
  [
    check("email").isEmail().withMessage("Invalid email"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  postRegister
);

//LOGIN

router.post("/login", postLogin);

//LOGOUT

router.get("/logout", getLogout);

//GET ALL USERS

router.get("/users", verifyToken, async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ users });
});

//TEST LOGIN
router.get("/testusers", verifyToken, async (req, res, next) => {
  res.send("Yes, you are logged in");
});

//TEST SUPPORT
router.get("/testsupport", verifySupport, async (req, res, next) => {
  res.send("Yes, you are support");
});

//TEST ADMIN
router.get("/testadmin", verifyAdmin, async (req, res, next) => {
  res.send("yes, you are admin");
});

module.exports = router;
