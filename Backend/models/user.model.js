const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true
        },
        lastname: {
            type: String
        }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    userImage: {
        type: String,
    },
    socketId: {
        type: String
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.methods.generateToken = function() {
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET);
    return token;
}
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password) 
}
userSchema.statics.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10);
} 
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')
    console.log(resetToken)
    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000 // 10 min
    return resetToken
  }   

 // Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // Only hash if password is new or modified

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});
 


module.exports = mongoose.model("User", userSchema);