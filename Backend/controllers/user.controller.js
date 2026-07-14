const userModel = require("../models/user.model");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const BlackListTokenModel = require("../models/blackListToken.model");
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const axios = require("axios");

module.exports.register = async (req, res) => {
  try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password)
      throw new Error("All fields are required");

    const existingUser = await userModel.findOne({ email });
    if (existingUser) throw new Error("User already exists");

    // Extract uploaded image (if present)
    const imageFile = req.files?.find((file) => file.fieldname === "userImage");
    const userImage = imageFile ? "user/" + imageFile.filename : null;

    // Create user object
    const userData = {
      fullname: {
        firstname: fullname.firstname,
        lastname: fullname.lastname,
      },
      email,
      password, 
    };

    if (userImage) {
      userData.userImage = userImage;
    }

    const user = await userModel.create(userData);
    const token = user.generateToken();
    res.status(201).json({ token, user });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
module.exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        
        if (!email || !password) {
            throw new Error("Email and password are required");
        }

        const user = await userModel.findOne({ email }).select("+password");
        if(!user)
            throw new Error("Invalid email or password");

        const isValid = await user.comparePassword(password);
        if(!isValid)
            throw new Error("Invalid email or password");

        const token = user.generateToken();
        user.password = undefined;
        res.status(200).json({ token, user }); 

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
module.exports.getUserProfile = async (req, res) => {
    res.status(200).json(req.user); 
};

module.exports.logout = async (req, res) => {
    res.clearCookie("token")
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    await BlackListTokenModel.create({ token });    
    res.status(200).json({ message: "Logout successful" });
};

module.exports.forgotPassword = async (req, res) => {
    try {
      const { email } = req.body
      const user = await userModel.findOne({ email })
      if (!user) throw new Error('User not found')
  
      const resetToken = user.createPasswordResetToken()
      await user.save({ validateBeforeSave: false })
  
      const resetUrl = `http://localhost:5173/reset-password/${resetToken}`
  
      const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS
        }
      })
  
      await transporter.sendMail({
        from: '"Uber Clone Support" <support@uberclone.com>',
        to: email,
        subject: 'Reset Your Password',
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 10 minutes.</p>`
      })

      res.status(200).json({message: 'Password reset email sent' })
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  }

  module.exports.resetPassword = async (req, res) => {
    try {
      const { token } = req.params
      const { password } = req.body
  
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  
      const user = await userModel.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      })
  
      if (!user) {
        return res.status(400).json({ error: 'Token is invalid or has expired' })
      }
  
      user.password = password
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
  
      await user.save()
  
      res.status(200).json({ message: 'Password reset successful' })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }



exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const googleRes = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );

    const { email, name, picture } = googleRes.data;

    if (!email || !name) {
      return res.status(400).json({ message: "Incomplete Google account information" });
    }

    let user = await userModel.findOne({ email });

    if (!user) {
      const [firstname, lastname] = name.split(" ");

      user = await userModel.create({
        fullname: {
          firstname: firstname || "Google",
          lastname: lastname || "User"
        },
        email,
        userImage: picture || null,
        password: crypto.randomBytes(16).toString("hex")
      });
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      user,
      token: jwtToken,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
}; 