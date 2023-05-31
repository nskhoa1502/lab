const express = require("express");
const { verifyToken, verifyAdmin } = require("../middleware/verifyToken");

const {
  deleteUser,
  getUser,
  getUsers,
} = require("../controllers/userController");

const router = express();

//DELETE USER
router.delete("/:id", verifyAdmin, deleteUser);

//GET ONE USER
router.get("/:id", verifyAdmin, getUser);

//GET ALL USERS
router.get("/", verifyAdmin, getUsers);

module.exports = router;
