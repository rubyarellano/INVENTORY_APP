const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const authMiddleware = require('../middleware/authMiddleware');

// Create Category
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required.' });

    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Category name already exists.' });

    const category = new Category({ name, description });
    await category.save();
    res.status(201).json({ message: 'Category created successfully.', category });
  } catch (err) {
    res.status(500).json({ message: 'Server error creating category.', error: err.message });
  }
});

// Get All Categories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching categories.', error: err.message });
  }
});

// Get Single Category
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching category.', error: err.message });
  }
});

// Update Category
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Category not found.' });
    res.json({ message: 'Category updated successfully.', category: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating category.', error: err.message });
  }
});

// Delete Category
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Category not found.' });
    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting category.', error: err.message });
  }
});

module.exports = router;
