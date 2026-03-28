const { MongoClient } = require('mongodb');

let client;
let database;

async function connectToMongo() {
  if (database) {
    return database;
  }

  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'airbnb';

  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI. Add it to your environment before starting the app.');
  }

  client = new MongoClient(mongoUri);
  await client.connect();
  database = client.db(dbName);

  return database;
}

function getDb() {
  if (!database) {
    throw new Error('MongoDB is not connected yet.');
  }

  return database;
}

module.exports = {
  connectToMongo,
  getDb,
};
