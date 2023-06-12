const { Router } = require('express');
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, forgotPassword, resetPassword, getUserDetails,updatePassword,updateUserProfile,getAllUsers,getDetailsofUser, updateUserProfileByAdmin, deleteUserProfileByAdmin, addNewAddress } = require("../controllers/user");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post('/users/registerUser', registerUser);
router.post('/users/loginUser', loginUser);
router.get('/users/logoutUser', logoutUser);
router.post('/users/forgotPassword', forgotPassword);
router.post('/users/addAddress', isAuthenticatedUser, addNewAddress);
router.put('/users/resetPassword/:token', resetPassword);
router.get('/users/getMyDetails', isAuthenticatedUser, getUserDetails);
router.put('/users/updatePassword', isAuthenticatedUser, updatePassword);
router.put('/users/updateProfile', isAuthenticatedUser, updateUserProfile);
router.get('/admin/getAllUsers', isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);
router.get('/admin/getThatUser/:id', isAuthenticatedUser, authorizeRoles("admin"), getDetailsofUser);
router.put('/admin/users/updateProfile/:id', isAuthenticatedUser, authorizeRoles("admin"), updateUserProfileByAdmin);
router.delete('/admin/users/deleteProfile/:id', isAuthenticatedUser, authorizeRoles("admin"), deleteUserProfileByAdmin);

module.exports = router;