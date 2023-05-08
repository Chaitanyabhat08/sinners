const { Router } = require("express");
const express = require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails,createProductReviews,getAllReviews,deleteReviews } = require("../controllers/product");
const { isAuthenticatedUser , authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.get('/products/getallproducts/', getAllProducts);
router.post('/admin/products/createNewProduct', isAuthenticatedUser,authorizeRoles("admin"),createProduct);
router.get('/products/getProductDetails/:id', getProductDetails);
router.put('/admin/products/updateProduct/:id',isAuthenticatedUser,authorizeRoles("admin"), updateProduct);
router.put('/admin/products/deleteProduct/:id', isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);
router.put('/products/review', isAuthenticatedUser, createProductReviews);
router.get('/products/getAllReviews', getAllReviews);
router.delete('/products/deleteReview',isAuthenticatedUser,deleteReviews);

module.exports = router;