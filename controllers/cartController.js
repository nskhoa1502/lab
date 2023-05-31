// Import required dependencies and modules
const { verifyAdmin } = require("../middleware/verifyToken");
const Cart = require("../models/Cart");

// CREATE CART
exports.postCart = async (req, res, next) => {
  const {
    userId,
    products: [{ productId, quantity }],
  } = req.body;

  try {
    // Check if cart already exists for the user
    const cart = await Cart.findOne({ userId });

    if (cart) {
      // If cart already exists, add product to the cart using addToCart method
      await cart.addToCart(productId, quantity);
      res.status(200).json(cart);
    } else {
      // Create a new cart and add the product to it
      const newCart = new Cart({
        userId,
        products: [{ productId, quantity }],
      });
      const savedCart = await newCart.save();
      res.status(201).json(savedCart);
    }
  } catch (err) {
    next(err);
  }
};

// GET ONE CART
exports.getUserCart = async (req, res, next) => {
  try {
    // Find the cart for the specified user and populate user and product details
    const cart = await Cart.findOne({ userId: req.params.userId })
      .populate({
        path: "userId",
        select: "fullname email phone",
      })
      .populate({
        path: "products.productId",
        select: "category img1 name price",
      });

    res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
};

// GET ALL CARTS
exports.getAllCarts = async (req, res) => {
  try {
    // Find all carts
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (err) {
    next(err);
  }
};

// UPDATE CART
exports.putCart = async (req, res, next) => {
  const { _id, userId, products } = req.body;

  try {
    // Find the cart by ID
    const cart = await Cart.findById(_id);

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Replace the cart data with the new cart data
    cart.userId = userId;
    cart.products = products;

    // Recalculate the total quantity
    cart.totalQuantity = products.reduce(
      (total, product) => total + product.quantity,
      0
    );

    // Save the updated cart
    await cart.save();

    res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
};

// DELETE CART
exports.deleteCart = async (req, res, next) => {
  try {
    // Find and delete the cart by ID
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json("Cart has been deleted");
  } catch (err) {
    next(err);
  }
};

// DELETE CART ITEM
exports.deleteCartItem = async (req, res, next) => {
  const { id, productId } = req.params;
  console.log(id);
  console.log(productId);

  try {
    // Find the cart by ID
    const cart = await Cart.findById(id);
    console.log(cart);

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Find the index of the product in the cart
    const productIndex = cart.products.findIndex(
      (product) => product.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found in the cart" });
    }

    // Remove the product from the cart
    cart.products.splice(productIndex, 1);

    // Recalculate the total quantity
    cart.totalQuantity = cart.products.reduce(
      (total, product) => total + product.quantity,
      0
    );

    // Save the updated cart
    await cart.save();

    res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
};
