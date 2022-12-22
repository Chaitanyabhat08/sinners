const userModel = require('../models/user');
const shortId = require('shortid');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncError = require('../middleware/asyncError');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail.js');
const crypto = require('crypto');

//Register a user
module.exports.registerUser = catchAsyncError(async(req, res, next) => {
    const { name, email, password } = req.body;
    const user = await userModel.create({
        name: name,
        email: email,
        password: password,
        avatar: {
            public_id: 'Sample',
            url: 'profile.jpg',
        }
    });
    sendToken(user,201,res);
});

module.exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    //checking if password and email is present
    if (!email || !password) {
        return next(new ErrorHandler("Please enter Email and Password", 400));
    }
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) { 
        return next(new ErrorHandler("Invalid Password or Email", 401));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) { 
        return next(new ErrorHandler("Invalid Password or Email", 401));
    }
    sendToken(user,200,res);
});

module.exports.logoutUser = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly:true,
    })
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await userModel.findOne({ email: req.body.email });
    let html = [`<h5>Hello ${user.name}</h5>`];
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    const resetToken = await user.resetPassword();
    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Your Password reset token is :- \n ${resetPasswordUrl}
    if you have not requested or already done, Please ignore this :) \n`;
    html.push(`<p>${message}</p>`);
    html.push(`<p>Thanks and Regards</p>`);
    html.push(`<p>Saints&Sinners</p>`);
    html.push(`<tr><img src="../assets/logoo.jpg" alt="s&s"></tr>`)

    html = html.join('');
    try {
        await sendEmail({
            email: user.email,
            subject: `Password Recovery Email for your S&S account`,
            html,
        });
        res.status(200).json({
            success: true,
            message: `Password Recover Eamil sent to ${user.email} successfully`,
        });
        
    } catch (err) { 
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpire = null;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(err.message,500));
    }
});

module.exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await userModel.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
        return next(new ErrorHandler("Reset password token is Invalid or Expires", 400));
    }
    if (req.body.password !== req.body.confirmPassword) { 
        return next(new ErrorHandler("Password does not match! Please try again", 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpire = null;
    await user.save({ validateBeforeSave: false });
    sendToken(user, 200, res);
});

module.exports.getUserDetails = catchAsyncError(async function (req, res, next) {
    const user = await userModel.findById(req.user.id);
       if (!user) {
        return next(new ErrorHandler("User Not Found", 400));
    }
    res.status(200).json({
        success: true,
        user,
    });
});

module.exports.updatePassword = catchAsyncError(async function (req, res, next) {
    const user = await userModel.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) { 
        return next(new ErrorHandler("Old password is Incorrect", 400));
    }
    if (req.body.newPassword == req.body.oldPassword) {
        return next(new ErrorHandler("New password should not be same as Old Password", 400));
    }
    if (req.body.newPassword !== req.body.confirmPassword) { 
        return next(new ErrorHandler("Password does not match! Please try again", 400));
    }
    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res);
});

module.exports.updateUserProfile = catchAsyncError(async function (req, res, next) {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }
    const user = await userModel.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        usefindAndModify:false,
    });
    res.status(200).json({
        success: true,
        user,
    });
});

module.exports.getAllUsers = catchAsyncError(async function(req, res, next)  {
    const users = await userModel.find();
    res.status(200).json({
        success: true,
        users
    });
});

module.exports.getDetailsofUser = catchAsyncError(async function(req, res, next)  {
    const users = await userModel.findById(req.params.id);
    if (!users) {
        return next(new ErrorHandler('user does not exist',404));
    }
    res.status(200).json({
        success: true,
        users
    });
});

module.exports.updateUserProfileByAdmin = catchAsyncError(async function (req, res, next) {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    }
    const user = await userModel.findById(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        usefindAndModify:false,
    });
    res.status(200).json({
        success: true,
        user,
    });
});

module.exports.deleteUserProfileByAdmin = catchAsyncError(async function (req, res, next) {
    const user = await userModel.findById(req.parmas.id);
    if (!user) {
        return next(new ErrorHandler(`User does not exist by ID :${req.params.id}`, 404));
    }
    await userModel.remove();
    res.status(200).json({
        success: true,
        message:"User deleted successfully",
    });
});