const Transaction = require("../models/Transaction.Model");
const Product = require("../models/Product.Model");
const User = require("../models/User.Model");

// Create Transaction
exports.createTransaction = async (req, res, next) => {
  const session = await Product.startSession();
  session.startTransaction();
  try {
    const { discount, user, products } = req.body;

    // Check if user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return next({ status: 404, message: "User not found" });
    }

    // Check if product exists and get the necessary fields
    const productsIds = products.map((product) => product.prod);
    const productsExists = await Product.find({
      _id: { $in: productsIds },
    }).select('_id name price variants');

    if (productsExists.length === 0) {
      return next({ status: 404, message: "Product not found" });
    }

    // Check product quantity
    for (const product of productsExists) {
      const requestedProduct = products.find((p) => p.prod.toString() === product._id.toString());
      const variant = product.variants.find(v => v.size === requestedProduct.size);
      if (!variant) {
        return next({ status: 400, message: `Size not found for product: ${product.name}` });
      }
      const color = variant.color.find(c => c.name === requestedProduct.color);
      if (!color) {
        return next({ status: 400, message: `Color not found for product: ${product.name}, size: ${variant.size}` });
      }
      if (requestedProduct.quantity > color.quantity) {
        return next({ status: 400, message: `Insufficient quantity for product: ${product.name}, size: ${variant.size}, color: ${color.name}` });
      }
    }

    // Calculate total price
    const totalPrice = productsExists.reduce((acc, product) => {
      const quantity = products.find((p) => p.prod.toString() === product._id.toString()).quantity;
      return acc + (product.price * quantity);
    }, 0);

    // Create the transaction
    const transaction = new Transaction({ discount, user, products, totalPrice: totalPrice * (1 - (discount / 100)) });
    await transaction.save();

    // Update product quantities
    for (const product of productsExists) {
      const requestedProduct = products.find((p) => p.prod.toString() === product._id.toString());
      const variant = product.variants.find(v => v.size === requestedProduct.size);
      const color = variant.color.find(c => c.name === requestedProduct.color);

      // Check if the quantity is sufficient before reducing it
      if (color.quantity < requestedProduct.quantity) {
        return next({ status: 400, message: `Insufficient quantity for product: ${product.name}, size: ${variant.size}, color: ${color.name}` });
      }
      
      color.quantity -= requestedProduct.quantity;
      variant.quantity -= requestedProduct.quantity;

      await product.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // Populate the newly created transaction
    const newTransaction = await Transaction.findById(transaction._id)
      .populate("user", "_id fullName email phone")
      .populate("products.prod", "name price");

    res.status(201).json({ 
      data: newTransaction,
      message: "Transaction created successfully!" 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next({ status: 500, message: error?.message });
  }
}

// Get all transactions
exports.getAllTransactions = async (req, res, next) => {
  try {
    const { page = 0, limit = 10, status } = req.query;

    const query = {
      status: status !== undefined ? status : { $regex: '', $options: 'i' },
    };

    const transactions = await Transaction
      .find(query)
      .populate("user", "_id fullName email phone")
      .populate("products.prod", "name price")
      .skip((page) * limit)
      .limit(limit);

    res.status(200).json({
      data: transactions,
      paging: {
        total: await Transaction.countDocuments(query),
        page: Number(page),
        limit: Number(limit),
      }
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
}

// Get transaction by id
exports.getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction
      .findById(id)
      .populate("user", "_id fullName email phone")
      .populate("products.prodId", "name price");
    if (!transaction) {
      return next({ status: 404, message: "Transaction not found" });
    }
    res.status(200).json({ data: transaction });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
}

// Update transaction
exports.updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const transaction = await Transaction.findByIdAndUpdate(id, { status }, { new: true });
    if (!transaction) {
      return next({ status: 404, message: "Transaction not found" });
    }
    res.status(200).json({ data: transaction });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
}