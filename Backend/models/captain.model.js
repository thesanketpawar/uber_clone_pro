const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const captainSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength:[3, "First name must be at least 3 characters long"]
        },
        lastname: {
            type: String,
            minlength:[3, "First name must be at least 3 characters long"]
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength:[5, "First name must be at least 5 characters long"]
    },
    password: {
        type: String,
        required: true,
        select: false
    },  
    socketId: {
        type: String
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive"
    },
    vehicle:{
        color:{
            type: String,
            required: true
        },
        plate:{
            type: String,
            required: true,
            minlength:[5, "Plate number must be at least 5 characters long"]    
        },
        capacity:{
            type: Number,
            required: true,
            min:[1, "Capacity must be at least 1"]
        },
        vehicleType:{
            type: String,
            required: true,
            enum:["car", "moto", "auto"]
        }
    },
    captainImage: {
        type: String,
    },
    location: {
        lat: {
            type: Number
        },
        lng: {
            type: Number
        }
    },
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpires: {
        type: Date,
        select: false
    },
    earnedMoney: {
        type: Number,
        default: 0
      },
    totalJobs: {
        type: Number,
        default: 0
      },
    totalDistance: {
        type: Number,
        default: 0
      },
    totalHoursOnline: {
        type: Number,
        default: 0
      },
    onlineStartTime: {
        type: Date,
        default: null
      }
});

captainSchema.methods.generateToken = function() {
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET);
    return token;
}
captainSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password) 
}
captainSchema.statics.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10);
}
captainSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

module.exports = mongoose.model("Captain", captainSchema);
    