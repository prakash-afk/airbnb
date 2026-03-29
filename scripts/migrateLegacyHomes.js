const loadEnv = require('../config/loadEnv');
const { connectToMongo, mongoose } = require('../config/mongo');
const User = require('../models/user');
require('../models/home');

loadEnv();

async function migrateLegacyHomes() {
  const targetEmail = process.argv[2]?.trim().toLowerCase();

  if (!targetEmail) {
    console.error('Usage: node scripts/migrateLegacyHomes.js <host-email>');
    process.exit(1);
    return;
  }

  await connectToMongo();

  const hostUser = await User.findByEmail(targetEmail);

  if (!hostUser) {
    console.error(`No user found for email: ${targetEmail}`);
    process.exit(1);
    return;
  }

  if (hostUser.userType !== 'host') {
    console.error(`User ${targetEmail} is not a host account.`);
    process.exit(1);
    return;
  }

  const HomeDocument = mongoose.model('Home');
  const ownerHostName = `${hostUser.firstName} ${hostUser.lastName}`.trim();

  const result = await HomeDocument.updateMany(
    {
      $or: [{ ownerHostId: { $exists: false } }, { ownerHostId: '' }, { ownerHostId: null }],
    },
    {
      $set: {
        ownerHostId: hostUser.id,
        ownerHostName,
      },
    }
  );

  console.log(`Legacy home migration completed for host: ${targetEmail}`);
  console.log(`Matched homes: ${result.matchedCount}`);
  console.log(`Updated homes: ${result.modifiedCount}`);

  await mongoose.connection.close();
}

migrateLegacyHomes().catch(async (error) => {
  console.error('Legacy home migration failed:', error.message);

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  process.exit(1);
});
