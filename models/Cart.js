const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    totalQuantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

cartSchema.methods.addToCart = async function (productId, quantity) {
  try {
    // Check if the product already exists in the cart
    const existingProduct = this.products.find(
      (product) => product.productId.toString() === productId.toString()
    );

    if (existingProduct) {
      // Update the quantity of the existing product
      existingProduct.quantity += quantity;
    } else {
      // Add a new product to the cart
      this.products.push({
        productId: productId,
        quantity: quantity,
      });
    }

    // Update the total quantity
    this.totalQuantity += quantity;

    // Save the updated cart
    await this.save();

    // Return the updated cart
    return this;
  } catch (err) {
    throw err;
  }
};

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
