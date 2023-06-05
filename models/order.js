const mongoose = require('mongoose');
const order = new mongoose.Schema({
    shippingInfo: {
        adress: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        pinCode: {
            type: Number,
            required:true,
        },
        phoneNumber: {
            type: Number,
            required:true,
        }
    },
    orderItems: [
        {
            name: {
                type: String,
                required:true,
            },
            price: {
                type: Number,
                required:true,
            },
            quantity: {
                type: Number,
                required:true,
            },
            image: {
                type: String,
                required:true,
            },
            product: {
                type: String,
                ref: 'Product',
                required:true,
            },
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    paymentInfo: {
        order_id: { type: String, required: true },
        payment_id: { type: String, required: true },
        razorpay_sign: { type: String, required: true },
        status: {type: String, required: true },
    },
    paidAt: {
        type: Date,
        required:true,
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    shippingPrice: {
        type: Number,
        required: true,
        default:0,
    },
    totalPrice: {
        type: Number,
        required: true,
        default:0,  
    },
    orderStatus: {
        type: String,
        required: true,
        default:'Processing'
    },
    deliveredAt: Date,
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model('Order', order);