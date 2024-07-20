const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.Model");

const JWT_SECRET = process.env.JWT_SECRET;

// Register controller
exports.register = async (req, res, next) => {
  try {
    const { fullName, phone, email, address, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next({ status: 400, message: "User already exists" });
    }

    // Create new user
    const user = new User({ fullName, phone, email, address, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
};

// Login controller
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return next({ status: 400, message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next({ status: 400, message: "Invalid email or password" });
    }

    // Generate JWT token
    const accessToken = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({ 
      data: {
        ...user._doc,
        accessToken,
        password: undefined,
        __v: undefined
      },
      message: "Login successfully"
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
};
