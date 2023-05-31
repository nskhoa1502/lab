// Import required dependencies and modules
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// CREATE USER
exports.postRegister = async (req, res, next) => {
  try {
    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Create a new User instance with encrypted password
    const newUser = new User({
      email: req.body.email,
      fullname: req.body.fullname,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.PASS_SECRET
      ).toString(),
      phone: req.body.phone,
      img: req.body.img,
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    // Return the saved user as a response
    res.status(201).json(savedUser);
  } catch (err) {
    next(err);
  }
};

// USER LOGIN
exports.postLogin = async (req, res, next) => {
  try {
    // Find the user with the provided email
    const user = await User.findOne({ email: req.body.email });

    // If the user does not exist, return an error response
    if (!user) {
      return res.status(401).json("Incorrect email");
    }

    // Decrypt the user's password and compare with the provided password
    const decryptedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SECRET
    ).toString(CryptoJS.enc.Utf8);

    // If the passwords don't match, return an error response
    if (decryptedPassword !== req.body.password) {
      return res.status(401).json("Incorrect email or password");
    }

    // Generate an access token with user ID and role
    const accessToken = jwt.sign(
      { user: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Exclude password and role from user object, set access token as a cookie, and return user details
    const { password, role, ...others } = user._doc;
    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
      })
      .status(200)
      .json({ message: "User login successfully", ...others, role });
  } catch (err) {
    next(err);
  }
};

// USER LOGOUT
exports.getLogout = async (req, res, next) => {
  try {
    // Clear the access_token cookie and return a success message
    res
      .clearCookie("access_token")
      .status(200)
      .json({ message: "User logged out successfully" });
  } catch (err) {
    next(err);
  }
};
