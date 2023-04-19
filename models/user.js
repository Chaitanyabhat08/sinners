const mongoose = require('mongoose');
const validator = require('validator');
const { default: isEmail } = require('validator/lib/isEmail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config({ path: '../config/.env' });

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        maxLength: [30, 'Name cannot exceed 30 characters'],
        minLength: [4, 'Name should be at least 4 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter email address'],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email address"],
    },
    phoneNumber: {
        type: Number,
        default: 9999999999,
        minLength:[10,"Please enter a valid phone number"]
    },
    password: {
        type: String,
        required: [true, 'Please enter password'],
        minLength: [8, 'Password must be at least 8 characters'],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    role: {
        type: String,
        default: 'user',
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordTokenExpire: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    address: {
        type:String,
    }
});
userSchema.pre("save", async function (next) {
        if (!this.isModified("password")) {
            next();
        }
        this.password = await bcrypt.hash(this.password, 11);
});
//JwT Token
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};
//Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
//reset Password
userSchema.methods.ResetPasswordToken = function () {
    // Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");
    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
  };

module.exports = mongoose.model('User',userSchema);