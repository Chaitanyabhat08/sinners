const express = require('express');
const router = express.Router();
const { newOrder, getSingleOrder,myOrders,getAllOrders, deleteOrder,updateOrderStatus,} = require("../controllers/order");
const { isAuthenticatedUser , authorizeRoles } = require("../middleware/auth");

router.post('/order/new', isAuthenticatedUser, newOrder);
router.get('/order/:id', isAuthenticatedUser, getSingleOrder);
router.get('/order/myOrders', isAuthenticatedUser, myOrders);
router.get('/admin/order/getAllOrders', isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);
router.delete('/order/deleteOrder', isAuthenticatedUser,authorizeRoles("admin"), deleteOrder);
router.put('/admin/order/updateOrderStatus', isAuthenticatedUser, authorizeRoles("admin"), updateOrderStatus);

module.exports = router;