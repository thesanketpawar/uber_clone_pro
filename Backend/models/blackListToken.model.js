const mongoose = require("mongoose");
const blackListTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '86400' // Token will expire after 1 day (86400 seconds)
    }
}, { timestamps: true });

module.exports = mongoose.model("BlackListToken", blackListTokenSchema);