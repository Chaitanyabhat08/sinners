const userModel = require('../models/user');
const shortId = require('shortid');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncError = require('../middleware/asyncError');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail.js');
const crypto = require('crypto');
const cloudinary = require('cloudinary');
const dotenv = require('dotenv');
dotenv.config({ path: '../config/.env' });

//Register a user
module.exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { userData } = req.body;
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });
    
    const { name, email, password } = req.body;
    const existing = await userModel.findOne({ email });
    if (existing) {
        return next(new ErrorHandler("User already exists,Please Login", 11000));
    }
      const user = await userModel.create({
        name,
        email,
        password,
        avatar: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
      });
      sendToken(user, 201, res);
});

module.exports.loginUser = async (req, res, next) => {
    console.log("heyyyyyy");
    try {
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
        sendToken(user, 200, res);
    } catch (error) {
        return next(new ErrorHandler(error));
    }
};

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
    if (!user) {
        return next(new ErrorHandler("You are not Registered With us, Please Register", 404));
    }
    let html = [`<h5>Hello ${user.name}</h5>`];
    const resetToken = await user.ResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // const resetPasswordUrl = `${req.protocol}://${req.get("host")}users/resetPassword/${resetToken}`;

    const resetPasswordUrl = `${process.env.FRONTEND_URL}users/resetPassword/${user.resetPasswordToken}`;
    const message = `Please click on this button to redirect to set up new password \n`;
    html.push(`<button style="background-color:white"><a href=${resetPasswordUrl}>Reset Password Link</a></button>`)
    html.push(`<p>${message}</p>`);
    html.push(`<p>Thanks and Regards</p>`);
    html.push(`<p>Saints&Sinners</p>`);
    html.push(`<tr><img src="./man.png" alt="s&s"></tr>`)

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

module.exports.updateUserProfile = async function (req, res, next) {
    try {
        let newUserData = {
            name: req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
        }
        if (req.body.avatar !== "") {
            const user1 = await userModel.findById(req.user.id);
            const imageId = user1.avatar.public_id;
            await cloudinary.v2.uploader.destroy(imageId);
            const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
                folder: "avatars",
                width: 150,
                crop: "scale",
            });
            newUserData.avatar = {
                public_id: myCloud.public_id,
                avatar: myCloud.secure_url,
            }
        }
        const user = await userModel.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            usefindAndModify: false,
        });
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
};

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

module.exports.addNewAddress = catchAsyncError(async function (req, res, next) {
    const user = await userModel.findById(req.user._id);
    user.address.push(req.body); // Push the new address to the address array
    await user.save(); // Save the updated user
    res.redirect("/users/getMyDetails"); // Redirect to a success page or another route
});
