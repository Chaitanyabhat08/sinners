const mongoose = require('mongoose');
const order = new mongoose.Schema({
    shippingInfo: {
        address: {
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
        phoneNo: {
            type: Number,
            required:true,
        }
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
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
    paymentInfo: {
    orderId: { type: String },
    subtotal: { type: Number },
    shippingCharges: { type: Number },
    tax: { type: Number },
    totalPrice: { type: Number },
    orderDate: { type: Date}
    },
    cartItems: {
        type: Array,
        required: true,
    }
});

module.exports = mongoose.model('Order', order);