const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, category, price, stock, supplier, sku } = req.body;

    if (!name || !category || price == null || stock == null) {
      return res.status(400).json({ message: 'All required fields (name, category, price, stock) must be provided.' });
    }

    const product = new Product({
      name,
      description,
      category,
      price,
      stock,
      supplier,
      sku,
    });

    await product.save();
    res.status(201).json({ message: 'Product created successfully.', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error while creating product.', error: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching products.', error: err.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching product.', error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, category, price, stock, description, supplier, sku } = req.body;

    if (!name && !category && price == null && stock == null && !description && !supplier && !sku) {
      return res.status(400).json({ message: 'At least one field must be provided to update.' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, price, stock, description, supplier, sku },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({ message: 'Product updated successfully.', product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: 'Server error while updating product.', error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error while deleting product.', error: err.message });
  }
});

module.exports = router;
