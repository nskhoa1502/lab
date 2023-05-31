const Order = require("../models/Order");
const { createError } = require("../helpers/error");
const nodemailer = require("nodemailer");
const { formatNumber } = require("../utils/convertion");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// CONFIGURE NODEMAILER
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "johan.beatty10@ethereal.email",
    pass: "4fSNT4126cfz3QqZDr",
  },
});

// CREATE ORDER
exports.postOrder = async (req, res, next) => {
  const { userId, products, fullName, email, phoneNumber, address } = req.body;

  try {
    // Calculate the total price and quantity based on the products
    let totalPrice = 0;
    let totalQuantity = 0;
    products.forEach((product) => {
      const { productId, quantity } = product;
      const { price } = productId;
      const totalProductPrice = quantity * price;
      totalPrice += totalProductPrice;
      totalQuantity += quantity;
    });

    // Create the order
    const newOrder = new Order({
      userId,
      products,
      totalPrice,
      fullName,
      email,
      phoneNumber,
      address,
    });

    // Save the order
    const savedOrder = await newOrder.save();

    // Create a transporter for sending emails

    // Configure email content
    const mailOptions = {
      from: "ktackboss@gmail.com",
      to: email,
      subject: "Order Confirmation",
      html: `
        <h1>Xin chào ${fullName}</h1>
        <p>Phone: ${phoneNumber}</p>
        <p>Address: ${address}</p>
        <table style="text-align: center; width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid black; padding: 10px;">Tên Sản phẩm</th>
              <th style="border: 1px solid black; padding: 10px;">Hình Ảnh</th>
              <th style="border: 1px solid black; padding: 10px;">Giá</th>
              <th style="border: 1px solid black; padding: 10px;">Số lượng</th>
              <th style="border: 1px solid black; padding: 10px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${products
              .map(
                (product) => `
              <tr>
                <td>${product.productId.name}</td>
                <td><img src="${product.productId.img1}" alt="${
                  product.productId.name
                }" height="50"></td>
                <td>${formatNumber(product.productId.price)} VND</td>
                <td>${product.quantity}</td>
                <td>${formatNumber(
                  product.quantity * product.productId.price
                )} VND</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <p style="text-align: center; margin-top: 20px;">Total Price: ${formatNumber(
          totalPrice
        )} VND</p>
        <p style="text-align: center;">Cảm ơn bạn!</p>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.status(201).json(savedOrder);
  } catch (err) {
    next(err);
  }
};

// GET USER ORDER
exports.getUserOrder = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const orders = await Order.find({ userId: userId }).populate({
      path: "products.productId",
      select: "img1 name price",
    });
    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

// GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

// UPDATE ORDER
exports.putOrder = async (req, res, next) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    next(err);
  }
};

// DELETE ORDER
exports.deleteOrder = async (req, res, next) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted");
  } catch (err) {
    next(err);
  }
};

//GET INVOICE
exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId).populate({
      path: "products.productId",
      select: "img1 name price",
    });

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set the response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=${orderId}.pdf`);

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add content to the PDF document
    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text(`Order ID: ${order._id}`);
    doc.moveDown();

    // Add the order details to the PDF document
    doc.fontSize(14).text("Products List:");
    doc.moveDown();

    order.products.forEach((product, index) => {
      doc.text(`${index + 1}. ${product.productId.name} x ${product.quantity}`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total Price: ${formatNumber(order.totalPrice)} VND`);

    // Finalize the PDF document
    // Optionally, you can save the PDF file to the server
    const filePath = path.join(__dirname, `../invoices/${orderId}.pdf`);
    doc.pipe(fs.createWriteStream(filePath));
    doc.end();
  } catch (err) {
    next(err);
  }
};
