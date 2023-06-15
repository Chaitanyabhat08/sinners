const express = require('express');
const router = express.Router();
const { displayRazor, verifyPayment,getAllOrders } = require("../controllers/Payment.js");
const dotenv = require('dotenv');
dotenv.config({ path: "./config/.env" });
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post('/razorpay', isAuthenticatedUser, displayRazor)
router.post("/payment/verify", isAuthenticatedUser,verifyPayment);
router.get("/payment/orders", isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

module.exports = router;