const express = require('express');
const router = express.Router();

const { isAuthenticatedUser } = require("../middleware/auth");
const { processPayment, sendStripeApiKey } = require("../controllers/Payment")

router.post('/payment/process', isAuthenticatedUser, processPayment);
router.get('/payment/stripeapikey', isAuthenticatedUser, sendStripeApiKey);

module.exports = router;