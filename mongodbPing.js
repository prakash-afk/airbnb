const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const values = {};

  for (const rawLine of fileContent.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function loadMongoConfig() {
  const envFilePath = path.join(__dirname, '.env');
  const fileEnv = readEnvFile(envFilePath);

  return {
    mongoUri: process.env.MONGODB_URI || fileEnv.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME || fileEnv.MONGODB_DB_NAME || 'airbnb',
    envFilePath,
  };
}

async function pingMongo() {
  const { mongoUri, dbName, envFilePath } = loadMongoConfig();

  if (!mongoUri) {
    console.error('MongoDB ping failed.');
    console.error('Missing MONGODB_URI in environment variables or .env.');
    console.error(`Checked fallback file: ${envFilePath}`);
    process.exitCode = 1;
    return;
  }

  let client;

  try {
    console.log('Starting MongoDB Atlas connectivity check...');
    console.log(`Using database: ${dbName}`);

    // Keep the script focused on connectivity: connect, ping once, then close.
    client = new MongoClient(mongoUri);

    console.log('Connecting to MongoDB Atlas...');
    await client.connect();

    console.log('Connection established. Running ping command...');
    await client.db(dbName).command({ ping: 1 });

    console.log('MongoDB ping succeeded. Your cluster is reachable.');
  } catch (error) {
    console.error('MongoDB ping failed.');
    console.error(`Reason: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed.');
    }
  }
}

pingMongo();
