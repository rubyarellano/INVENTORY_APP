const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

// Create Transaction
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, type, quantity, date, notes } = req.body;
    if (!productId || !type || !quantity || !date)
      return res.status(400).json({ message: 'All required fields must be provided.' });

    const transaction = new Transaction({ productId, type, quantity, date, notes });
    await transaction.save();

    // Optionally update stock if linked to product
    if (type === 'in') await Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } });
    if (type === 'out') await Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });

    res.status(201).json({ message: 'Transaction created successfully.', transaction });
  } catch (err) {
    res.status(500).json({ message: 'Server error creating transaction.', error: err.message });
  }
});

// Get All Transactions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('productId').sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching transactions.', error: err.message });
  }
});

// Get Single Transaction
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('productId');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching transaction.', error: err.message });
  }
});

// Update Transaction
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Transaction not found.' });
    res.json({ message: 'Transaction updated successfully.', transaction: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating transaction.', error: err.message });
  }
});

// Delete Transaction
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Transaction not found.' });
    res.json({ message: 'Transaction deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting transaction.', error: err.message });
  }
});

module.exports = router;
