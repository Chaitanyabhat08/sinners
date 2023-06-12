const mongoose = require('mongoose');

const product = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'please enter product name'],
    },
    description: {
        type: String,
        required: [true, 'please enter product description'],
    },
    gender: {
        type: String,
        required: [true, 'please mention gender'],
        minlength: 1,
        maxlength: 1,
    },  
    size: [{
        sizeLength:{
        type: String,
        required: ['true', 'please mention the clothes size'],
        },
        stockOfEach:{
            type: Number,
            required: ['true', 'please mention the stock of each'],
        }
}],
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        maxLength: [8, "Price cannot exceed 8 digits"],
    },
    rating: {
        type: Number,
        default: 0,
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
    }],
    category: {
            type: String,
            required: [true,"Please Enter product category"]
    },
    stock: {
        type: Number,
        required: [true,"Please Enter Product Stock"],
        default: 1,
        maxLength:[4, "stock cannot exceed maximum number 9999"]
    },
    numOfReviews: {
        type: Number,
        default:0,

    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
            },
            name: {
                type: String,
            },
            rating: {
                type: Number,
                // required: [true,"Please enter product reviews rating"],
            },
            comment: {
                type: String,
                // required: true,
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    active: {
        type: Boolean,
        default: true,
    },
    
});

module.exports = mongoose.model('Product', product);