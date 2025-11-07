const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const authMiddleware = require('../middleware/authMiddleware');

// Create Supplier
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required.' });

    const supplier = new Supplier({ name, email, phone, address });
    await supplier.save();
    res.status(201).json({ message: 'Supplier created successfully.', supplier });
  } catch (err) {
    res.status(500).json({ message: 'Server error creating supplier.', error: err.message });
  }
});

// Get All Suppliers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching suppliers.', error: err.message });
  }
});

// Get Single Supplier
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found.' });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching supplier.', error: err.message });
  }
});

// Update Supplier
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const updated = await Supplier.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Supplier not found.' });
    res.json({ message: 'Supplier updated successfully.', supplier: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating supplier.', error: err.message });
  }
});

// Delete Supplier
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Supplier not found.' });
    res.json({ message: 'Supplier deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting supplier.', error: err.message });
  }
});

module.exports = router;
