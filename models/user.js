const { mongoose } = require('../config/mongo');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ['guest', 'host'],
      default: 'guest',
    },
    favouriteHomeIds: {
      type: [String],
      default: [],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const UserDocument = mongoose.models.User || mongoose.model('User', userSchema, 'users');

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: String(user._id),
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    userType: user.userType || 'guest',
    favouriteHomeIds: Array.isArray(user.favouriteHomeIds) ? user.favouriteHomeIds : [],
    password: user.password,
  };
}

module.exports = class User {
  static create(payload) {
    return new UserDocument(payload).save().then((user) => normalizeUser(user.toObject()));
  }

  static findByEmail(email) {
    return UserDocument.findOne({ email: email?.trim().toLowerCase() }).lean().then(normalizeUser);
  }

  static findById(userId) {
    return UserDocument.findById(userId).lean().then(normalizeUser);
  }

  static toggleFavouriteHome(userId, homeId) {
    return UserDocument.findById(userId)
      .then((user) => {
        if (!user) {
          return null;
        }

        const existingIds = new Set((user.favouriteHomeIds || []).map(String));
        let isFavourite = false;

        if (existingIds.has(homeId)) {
          existingIds.delete(homeId);
        } else {
          existingIds.add(homeId);
          isFavourite = true;
        }

        user.favouriteHomeIds = [...existingIds];

        return user.save().then(() => ({
          isFavourite,
          favouriteHomeIds: user.favouriteHomeIds,
        }));
      });
  }
};
