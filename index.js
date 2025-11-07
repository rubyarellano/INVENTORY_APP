require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db("inventory_db");

    // Collections
    const users = db.collection("users");
    const products = db.collection("products");
    const categories = db.collection("categories");
    const suppliers = db.collection("suppliers");
    const transactions = db.collection("transactions");

    // Show sample documents for confirmation
    const sampleUser = await users.findOne({});
    const sampleProduct = await products.findOne({});
    const sampleCategory = await categories.findOne({});
    const sampleSupplier = await suppliers.findOne({});
    const sampleTransaction = await transactions.findOne({});

    console.log(" Sample User:", sampleUser);
    console.log(" Sample Product:", sampleProduct);
    console.log(" Sample Category:", sampleCategory);
    console.log(" Sample Supplier:", sampleSupplier);
    console.log(" Sample Transaction:", sampleTransaction);


  } catch (error) {
    console.error("Error connecting:", error);
  } finally {
    await client.close();
  }
}

main();