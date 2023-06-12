const { Router } = require("express");
const express = require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReviews, getAllReviews, deleteReviews } = require("../controllers/product");
const ErrorHandler = require('../utils/errorhandler');
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config({ path: './config/.env' });
const productModel = require('../models/product');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const shortId = require("shortid");

const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'ap-south-1',
});

const upload = multer({
  storage: multerS3({
    s3: S3,
    bucket: 'saintsandsinners2',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, files, cb) {
      console.log('Metadata:', files);
      cb(null, { fieldName: files.fieldname });
    },
    key: function (req, files, cb) {
      console.log('Key:', files);
      cb(null, Date.now().toString());
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

router.post('/admin/products/createNewProduct', isAuthenticatedUser, authorizeRoles("admin"), async (req, res) => {
  try {
    console.log("thsis siss body", req.body)
    const files = req.files;
    console.log("this is files", files);
    // files.forEach(file => {
    //   console.log(file.originalname, file.location);
    // });
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
      user: req.user._id,
      gender: req.body.gender ? req.body.gender : 'N/A',
      createdAt: new Date(),
    }
    const createProduct = await productModel.create(product);
    res.status(201).json({ success: true, createProduct });
  } catch (error) {
    const err = new ErrorHandler(error.message, 500);
    res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }
});

router.get('/products/getallproducts/', getAllProducts);
router.get('/products/getProductDetails/:id', getProductDetails);
router.put('/admin/products/updateProduct/:id',isAuthenticatedUser,authorizeRoles("admin"), updateProduct);
router.put('/admin/products/deleteProduct/:id', isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);
router.put('/products/review', isAuthenticatedUser, createProductReviews);
router.get('/products/getAllReviews', getAllReviews);
router.delete('/products/deleteReview',isAuthenticatedUser,deleteReviews);

module.exports = router;