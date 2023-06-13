const express = require('express');
const router = express.Router();
const { displayRazor, verifyPayment,getAllOrders } = require("../controllers/Payment.js");
const dotenv = require('dotenv');
dotenv.config({ path: "./config/.env" });

router.post('/razorpay', displayRazor)
router.post("/payment/verify", verifyPayment);
router.get("/payment/orders", getAllOrders);

module.exports = router;