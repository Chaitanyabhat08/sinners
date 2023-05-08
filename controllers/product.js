const productModel = require('../models/product');
const shortId = require('shortid');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncError = require('../middleware/asyncError');
const ApiFeatures = require('../utils/apiFeatures');

module.exports.getAllProducts = catchAsyncError(async (req, res, next) => {
    const resultPerPage = 8;
    const productCount = await productModel.countDocuments();
    const apiFeature = new ApiFeatures(productModel.find(), req.query).search().filter();
    const products = await apiFeature.query;
    res.status(201).send({
        success:true,
        products,
        productCount,
        resultPerPage,
    });
});
module.exports.getProductsCategoryWise = catchAsyncError(async (req, res) => {
    console.log("yooyoyoyoyoyoyo");
    console.log("params  bro", req.params);
    const resultPerPage = 8;
    const productCount = await productModel.countDocuments();
    const apiFeature = new ApiFeatures(productModel.find(), req.query).search().filter();
    const products = await apiFeature.query;
    res.status(201).send({
        success: true,
        products,
        productCount,
        resultPerPage,
    });
});
//create a new product
module.exports.createProduct = catchAsyncError(async (req, res, next) => {
    req.body.user = req.user.id;
    const product = {
        productId: shortId.generate(),
        name: req.body.name ? req.body.name : 'N/A',
        description: req.body.description ? req.body.description : 'N/A',
        price: req.body.price ? req.body.price : 'N/A',
        rating: req.body.rating ? req.body.rating : 'N/A',
        images: req.body.images ? req.body.images : 'N/A',
        category: req.body.category ? req.body.category : 'N/A',
        stock: req.body.stock ? req.body.stock : 1,
        numOfReviews: req.body.numOfReviews ? req.body.numOfReviews : 'N/A',
        reviews: req.body.reviews ? req.body.reviews : 'N/A',
        user: req.body.user,
        gender: req.body.gender ? req.body.gender : 'N/A',
        createdAt: new Date(),
    }
    const createProduct = await productModel.create(product);
    res.status(201).json({
        success: true,
        product
    });
});

module.exports.getProductDetails = catchAsyncError(async (req, res, next) => {
    const product = await productModel.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({
        success: true,
        product,
    });
});

module.exports.updateProduct = catchAsyncError(async (req, res, next) => {
    let product = await productModel.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }
    product = await productModel.findByIdAndUpdate(req.params.id, req.body,
        {
            new: true,
            runValidators:true,
            usefindAndModify: true
        });
    res.status(200).json({
        success: true,
        product
    });
});

module.exports.deleteProduct = catchAsyncError(async (req, res, next) =>{
    const product = await productModel.findOne({ productId: req.params.id });
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }
    await product.updateOne({ active: false });
    res.status(200).json({
        success: true,
        message: "Product Deleted Successfully"
    });
});

module.exports.createProductReviews = catchAsyncError(async (req, res, next) => {
    const { rating, comment, productid } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }
    const product = await productModel.findOne({ productId: req.body.productid });
    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );
    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.rating = rating
                rev.comment = comment
            }
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }
    let avg = 0;
    product.reviews.forEach(rev => {
        avg += rev.rating;
    })
    product.ratings = avg / product.reviews.length;
    await product.save({ validateBeforeSave: false });
    res.status(200).json({
        status: true,
    });
});

module.exports.getAllReviews = catchAsyncError(async function (req, res, next) {
    const product = await productModel.findOne({ productId: req.query.id });
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

module.exports.deleteReviews = catchAsyncError(async function (req, res, next) {
    const product = await productModel.findOne({ productId: req.query.productId });
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }
    const reviews = product.reviews.filter(rev => rev._id.toString() === req.query.id.toString());
    let avg = 0;
    reviews.forEach(rev => {
        avg += rev.rating;
    })
    const ratings = avg / reviews.length;
    const numOfReviews = reviews.length;
    await product.findByIdAndUpdate(req.query.productId, {
        reviews,ratings,numOfReviews
    }, {
        new: true,
        runValidators: true,
        usefindAndModify:false,
    });
    res.status(200).json({
        status: true,
    });
});