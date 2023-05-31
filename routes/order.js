const express = require("express");
const { verifyToken, verifyAdmin } = require("../middleware/verifyToken");
const {} = require("../controllers/cartController");
const {
  postOrder,
  getUserOrder,
  getAllOrders,
  deleteOrder,
  putOrder,
  getInvoice,
} = require("../controllers/orderController");

const router = express();

//CREATE ORDER
router.post("/", verifyToken, postOrder);

//UPDATE ORDER
router.put("/:id", verifyToken, putOrder);

//DELETE ORDER
router.delete("/:id", deleteOrder);

//GET ONE ORDER
router.get("/:userId", verifyToken, getUserOrder);

//GET ALL ORDERS
router.get("/", verifyAdmin, getAllOrders);

//GET INVOICE
router.get("/invoice/:id", verifyToken, getInvoice);

module.exports = router;
