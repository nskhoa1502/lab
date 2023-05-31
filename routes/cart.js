const express = require("express");
const { verifyToken, verifyAdmin } = require("../middleware/verifyToken");
const {
  postCart,
  getAllCarts,
  putCart,
  getUserCart,
  deleteCart,
  deleteCartItem,
} = require("../controllers/cartController");

const router = express();

//CREATE CART
router.post("/", verifyToken, postCart);

//UPDATE CART
router.put("/:id", verifyToken, putCart);

//DELETE CART
router.delete("/:id", deleteCart);

//DELETE ITEM
router.delete("/:id/:productId", deleteCartItem);

//GET CART
router.get("/:userId", verifyToken, getUserCart);

//GET ALL CARTS
router.get("/", verifyAdmin, getAllCarts);

module.exports = router;
