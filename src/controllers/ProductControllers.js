const Product = require("../models/Product.Model");

// Get all products
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 0,
      limit = 10,
      name,
      category,
      fromPrice,
      toPrice,
      sortBy = "createdAt desc",
    } = req.query;
    const query = {
      name: { $regex: name !== undefined ? name : '', $options: 'i' },
    };
    if (category) {
      query.category = category;
    }
    if (fromPrice) {
      query.price = { $gte: fromPrice };
    }
    if (toPrice) {
      if (query.price) {
        query.price.$lte = toPrice;
      } else {
        query.price = { $lte: toPrice };
      }
    }
    const products = await Product.find(query)
      .populate("category", "_id name")
      .sort({ [sortBy.split(" ")[0]]: sortBy.split(" ")[1] })
      .skip(page * limit)
      .limit(limit);
    const totalDocuments = await Product.countDocuments(query);
    res.status(200).json({
      data: products,
      paging: {
        page: Number(page),
        limit: Number(limit),
        total: totalDocuments
      },
      message: "Get all products successfully",
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
}

// Get product by id
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category", "_id name");
    if (!product) {
      return next({ status: 404, message: "Product not found" });
    }
    res.status(200).json({
      data: product,
      message: "Get product successfully",
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
}

// Create new product
exports.createProduct = async (req, res, next) => {
  try {
    const { name, price, category, description, images, variants } = req.body;
    const product = new Product({ name, price, category, description, images, variants });
    await product.save();
    res.status(201).json({
      data: product,
      message: "Create product successfully",
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
}

// Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, description, images, variants } = req.body;
    const product = await Product.findOneAndUpdate({ _id: id }, { name, category, description, images, variants }, { new: true });
    if (!product) {
      return next({ status: 404, message: "Product not found" });
    }
    res.status(200).json({
      data: product,
      message: "Update product successfully",
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
}

// Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndDelete({ _id: id });
    if (!product) {
      return next({ status: 404, message: "Product not found" });
    }
    res.status(200).json({
      data: product,
      message: "Delete product successfully",
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
}

// Get product GraphQL
exports.getProductGraphQL = async (page, limit, sortBy) => {
  try {
    const skip = page * limit;
    const products = await Product.find()
      .populate("category", "_id name code")
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy.split(" ")[0]]: sortBy.split(" ")[1] });
    const total = await Product.countDocuments();

    return {
      data: products,
      paging: {
        total,
        limit,
        page,
      },
      message: 'Get products successfully',
    };
  } catch (err) {
    throw new Error('Error fetching products');
  }
};