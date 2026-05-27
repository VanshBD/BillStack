/**
 * Quick DB checker to list collections and confirm connection
 * Usage: `node src/db/check.js`
 */
const mongoose = require('mongoose');
const config = require('../config');

async function run() {
  try {
    await mongoose.connect(config.database);
    console.log('Connected to MongoDB:', config.database);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    collections.forEach((c) => {
      console.log('-', c.name);
    });
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
}

run();
