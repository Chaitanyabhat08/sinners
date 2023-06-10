const { Router } = require("express");
const express = require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails,createProductReviews,getAllReviews,deleteReviews } = require("../controllers/product");
const { isAuthenticatedUser , authorizeRoles } = require("../middleware/auth");
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config({ path: './config/.env' });
const productModel = require('../models/product');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Readable } = require("stream");
const shortId = require("shortid");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'ap-south-1',
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'saintsandsinners',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
}).array('images', 5);

router.post('/admin/products/createNewProduct', isAuthenticatedUser, authorizeRoles("admin"), upload, async (req, res) => {
  console.log(req.files)
  const files = req.file;
  files.forEach(file => {
    console.log(file.originalname, file.location);
  });
  console.log(req.file);
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
  console.log('object', product);
  const createProduct = await productModel.create(product);
  console.log('this is created product', createProduct)
  res.status(201).json({
    success: true,
    createProduct
  });
});

router.get('/products/getallproducts/', getAllProducts);
router.get('/products/getProductDetails/:id', getProductDetails);
router.put('/admin/products/updateProduct/:id',isAuthenticatedUser,authorizeRoles("admin"), updateProduct);
router.put('/admin/products/deleteProduct/:id', isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);
router.put('/products/review', isAuthenticatedUser, createProductReviews);
router.get('/products/getAllReviews', getAllReviews);
router.delete('/products/deleteReview',isAuthenticatedUser,deleteReviews);

module.exports = router;