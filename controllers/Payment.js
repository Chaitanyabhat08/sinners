const catchAsyncError = require('../middleware/asyncError');
const Razorpay = require('razorpay');
const shortid = require('shortid');
const path = require('path');
const cors = require('cors');
const crypto = require("crypto");
const dotenv = require('dotenv');
dotenv.config({ path: "./config/.env" });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

module.exports.displayRazor = catchAsyncError(async function (req, res) {
  const payment_capture = 1;
  const currency = 'INR';
  const options = {
    amount: req.body.totalPrice * 100,
    currency: currency,
    receipt: shortid.generate(),
    payment_capture
  };
  try {
    const response = await razorpay.orders.create(options);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch(error) {
    console.log("error1", error);
  }
});

module.exports.verifyPayment = catchAsyncError(async function (req, res) {
  let body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
  var expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY )
    .update(body.toString())
    .digest('hex');
  var response = { "signatureIsValid": "false" }
  const isAuthentic = expectedSignature === req.body.razorpay_signature;
  const payload = {
    payment_id: req.body.razorpay_payment_id,
    order_id: req.body.razorpay_order_id,
  }
  if (isAuthentic) {
    const queryString = new URLSearchParams(payload).toString();
    res.status(200).redirect(`http://localhost:3000/payment/verified?${queryString}`);
  } else {
    res.redirect(`http://localhost:3000/payment/failed`);
   }
});
