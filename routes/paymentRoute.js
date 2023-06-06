const express = require('express');
const router = express.Router();
const { displayRazor, verifyPayment } = require("../controllers/Payment.js");
const dotenv = require('dotenv');
dotenv.config({ path: "./config/.env" });

router.post('/razorpay', displayRazor)
router.post("/payment/verify", verifyPayment);

module.exports = router;