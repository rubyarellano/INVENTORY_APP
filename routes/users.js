const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');

// Create User
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;
    if (!username || !email || !password || !firstName || !lastName)
      return res.status(400).json({ message: 'All required fields must be provided.' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed, firstName, lastName, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully.', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error creating user.', error: err.message });
  }
});

// Get All Users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching users.', error: err.message });
  }
});

// Get Single User
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching user.', error: err.message });
  }
});

// Update User
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password)
      updateData.password = await bcrypt.hash(updateData.password, 10);

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User updated successfully.', user: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating user.', error: err.message });
  }
});

// Delete User
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting user.', error: err.message });
  }
});

module.exports = router;
