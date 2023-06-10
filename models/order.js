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
        subtotal: {type: Number, required: true},
        shippingCharges: {type: Number, required: true},
        tax: {type: Number, required: true},
        totalPrice: {type: Number, required: true},
        orderDate: {type: Date, required: true}
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
    orderItems: {
        type: Array,
        required: true,
    }
});

module.exports = mongoose.model('Order', order);