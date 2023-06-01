const asyncError = require('../middleware/asyncError');
const catchAsyncError = require('../middleware/asyncError');
const dotenv = require('dotenv');
dotenv.config({ path: '../config/.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports.processPayment = catchAsyncError(async function (req, res,next) {
  const payment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    metadata: {
      company: "S&S"
    },
  });
  console.log('heyeyyeyye')
  console.log(payment.client_secret)
  res.status(200).json({success:true, client_secret:payment.client_secret});
});

module.exports.sendStripeApiKey = catchAsyncError(async function (req, res, next) { 
  res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
})