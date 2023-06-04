const express = require('express');
const app = express();
const cloudinary = require('cloudinary');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');
const Razorpay = require('razorpay');
const shortid = require('shortid');
const path = require('path');

dotenv.config({ path: './config/.env' });

const razorpay = new Razorpay({
    key_id: "rzp_test_wBU9x1cN57zN3f",
    key_secret: "uci7KIIDxHSlSJ62MlNaB1GB",
});

app.get('/logo.jpg', (req, res) => {
    res.sendFile(path.join(__dirname, 'logo.jpg'));
});

app.post('/razorpay', async (req, res) => {
    const payment_capture = 1;
    const amount = 499;
    const currency = 'INR';
    const options = {
        amount: amount * 100,
        currency: currency,
        receipt: shortid.generate(),
        payment_capture
    };

    try {
        const response = await razorpay.orders.create(options);
        console.log('ress',response);
        res.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount,
        });
    } catch (error) {
        console.log(error);
    }
});

// Handling uncaught exceptions
process.on('uncaughtException', err => {
    console.log("Error: " + err.message);
    console.log('Shutting down server due to uncaught Exception: ' + err.stack);
    server.close(() => {
        process.exit(1);
    });
});

connectDatabase();

const server = app.listen(process.env.PORT, () => {
    console.log(`Your server is running on http://localhost:${process.env.PORT}`);
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Unhandled promise rejection
process.on('unhandledRejection', err => {
    console.log("Error: " + err.message);
    console.log('Shutting down server due to unhandled rejection: ' + err.stack);
    server.close(() => {
        process.exit(1);
    });
});