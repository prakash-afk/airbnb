const mongoose = require('mongoose');

async function connectToMongo() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'airbnb';

  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI. Add it to your environment before starting the app.');
  }

  await mongoose.connect(mongoUri, {
    dbName,
  });

  return mongoose.connection;
}

function getDb() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB is not connected yet.');
  }

  return mongoose.connection;
}

module.exports = {
  connectToMongo,
  getDb,
  mongoose,
};
