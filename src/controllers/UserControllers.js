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

//Get all users
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 0, limit = 10, fullName, phone, email, status, role } = req.query;

    const query = {
      fullName: { $regex: fullName !== undefined ? fullName : '', $options: 'i' },
      phone: phone !== undefined ? phone : { $regex: '', $options: 'i' },
      email: { $regex: email !== undefined ? email : '', $options: 'i' },
      status: status !== undefined ? status : { $regex: '', $options: 'i' },
      role: role !== undefined ? role : { $regex: '', $options: 'i' },
    };

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page) * limit)
      .limit(limit);

    res.status(200).json({ 
      data: users,
      paging: {
        page: Number(page),
        limit: Number(limit),
        total: await User.countDocuments(query),
      },
      message: "Get users successfully", 
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
};

//Get user by id
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) {
      return next({ status: 404, message: "User not found" });
    }
    res.status(200).json({ 
      data: user 
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
};

//Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return next({ status: 404, message: "User not found" });
    }
    res.status(200).json({ 
      data: user 
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
};

//Update user
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, phone, email, address, password } = req.body;
    const user = await User.findByIdAndUpdate(id, { fullName, phone, email, address, password });
    if (!user) {
      return next({ status: 404, message: "User not found" });
    }
    res.status(200).json({ 
      data: user 
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
};
