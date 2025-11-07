require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ MongoDB connection URI from .env
const uri = process.env.MONGODB_URI;

// ✅ Helper to connect to DB (reusable)
async function getDb() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("inventory_db");
  return { db, client };
}

// ✅ REGISTER USER
async function registerUser(username, email, password, firstName, lastName) {
  const { db, client } = await getDb();
  try {
    const users = db.collection("users");

    // 1️⃣ Check if username or email already exists
    const existingUser = await users.findOne({
      $or: [{ username }, { email }]
    });
    if (existingUser) {
      console.log("❌ User already exists");
      return;
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Create new user document
    const newUser = {
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: "user", // default
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null
    };

    // 4️⃣ Insert user
    const result = await users.insertOne(newUser);
    console.log("✅ User registered successfully:", result.insertedId);
  } catch (error) {
    console.error("❌ Registration Error:", error.message);
  } finally {
    await client.close();
  }
}

// ✅ LOGIN USER
async function loginUser(email, password) {
  const { db, client } = await getDb();
  try {
    const users = db.collection("users");

    // 1️⃣ Find user by email
    const user = await users.findOne({ email });
    if (!user) {
      console.log("❌ Invalid email or password");
      return;
    }

    // 2️⃣ Check account status
    if (!user.isActive) {
      console.log("❌ Account is deactivated");
      return;
    }

    // 3️⃣ Compare passwords
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("❌ Invalid email or password");
      return;
    }

    // 4️⃣ Update login info
    await users.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date(), updatedAt: new Date() } }
    );

    // 5️⃣ Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "24h" }
    );

    // 6️⃣ Show result
    console.log("✅ Login successful!");
    console.log("User:", user.email);
    console.log("JWT Token:", token);
  } catch (error) {
    console.error("❌ Login Error:", error.message);
  } finally {
    await client.close();
  }
}

module.exports = { registerUser, loginUser };
