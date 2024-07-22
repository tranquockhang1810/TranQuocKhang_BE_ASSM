const Category = require("../models/Category.Model");
const Product = require("../models/Product.Model");

// Get all categories
exports.getCategories = async (req, res, next) => {
  try {
    const { page = 0, limit = 10, name, code } = req.query;
    const query = {
      name: { $regex: name !== undefined ? name : '', $options: 'i' },
      code: code !== undefined ? code : { $regex: '', $options: 'i' }
    };

    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);
    
    const totalDocuments = await Category.countDocuments(query);

    res.status(200).json({
      data: categories,
      paging: {
        page: Number(page),
        limit: Number(limit),
        total: totalDocuments
      },
      message: "Get all categories successfully",
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
}

// Create new category
exports.createCategory = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    // Check code exists
    const existingCategory = await Category.findOne({ code });
    if (existingCategory) {
      return next({ status: 400, message: "Code already exists" });
    }
    const category = new Category({ name, code });
    await category.save();
    res.status(201).json({
      data: category,
      message: "Create category successfully",
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
}

// Update category
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    const category = await Category.findOneAndUpdate({ _id: id }, { name, code }, { new: true });
    if (!category) {
      return next({ status: 404, message: "Category not found" });
    }
    res.status(200).json({
      data: category,
      message: "Update category successfully",
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
}

// Delete category
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findOneAndDelete({ _id: id });
    if (!category) {
      return next({ status: 404, message: "Category not found" });
    }
    //Delete products
    await Product.deleteMany({ category: id });
    res.status(200).json({
      data: category,
      message: "Delete category successfully",
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
}