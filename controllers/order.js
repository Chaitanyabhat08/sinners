const orderModel = require("../models/order");
const productModel = require('../models/product');
const shortId = require('shortid');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncError = require('../middleware/asyncError');
const ApiFeatures = require('../utils/apiFeatures');

module.exports.newOrder = catchAsyncError(async function (req, res, next) {
    const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
    
    const order = await orderModel.create({
        shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice, paidAt: Date.now(),
        user: req.user._id
    });
    res.status(200).json({
        success: true,
        order,
    });
});

module.exports.getSingleOrder = catchAsyncError(async function (req, res, next) {
    const order = await orderModel.findById(req.params.id).populate("user", "name email");
    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }
    res.status(200).json({
        success: true,
        order,
    });
});

module.exports.myOrders = catchAsyncError(async function (req, res, next) {
    const order = await orderModel.find({ user: req.user._id });
    res.status(200).json({
        success: true,
        order,
    });
});

module.exports.getAllOrders = catchAsyncError(async function (req, res, next) {
    const orders = await orderModel.find();
    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice;
    });
    res.status(200).json({
        success: true,
        orders,
        totalAmount,
    });
});

module.exports.deleteOrder = catchAsyncError(async function (req, res, next) {
    const order = await orderModel.findById(req.params.id);
    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }
    await order.remove();
    res.status(200).json({
        success: true,
        message:'Order deleted successfully',
    });
});

module.exports.updateOrderStatus = catchAsyncError(async function (req, res, next) {
    const order = await orderModel.findById(req.params.id);
    if (!order) {
        return next(new ErrorHandler('Order not found', 404));
    }
    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler('Already delivered', 400));
    }
    order.orderItems.forEach(async order => {
        await UpdateStock(order.product, order.quantity);
    });

    order.orderStatus = req.body.status;
    if (req.body.status === "Delivered") {
         order.deliveredAt = Date.now()
    }
    await order.save({ validateBeforeSave: false});
    res.status(200).json({
        success: true,
    });
});

async function UpdateStock(id, quantity) {
    const product = await productModel.findOne({ productId: id });
    product.stock -= quantity;
    await product.save({validateBeforeSave: false});
}