const { randomUUID } = require('crypto');

const { mongoose } = require('../config/mongo');

const allowedHomeTypes = ['House', 'Apartment', 'Cabin', 'Beach House', 'Farm', 'Villa'];
const allowedAvailability = ['available', 'unavailable'];
const textPattern = /^(?=.*[A-Za-z])[A-Za-z0-9\s,.'-]+$/;
const reviewTextPattern = /^(?=.*[A-Za-z])[A-Za-z0-9\s,.'!?\-]+$/;

const homeSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: randomUUID,
      required: true,
      unique: true,
    },
    houseName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    photo: {
      type: String,
      default: '',
      trim: true,
    },
    homeType: {
      type: String,
      default: '',
      trim: true,
    },
    maxGuests: {
      type: Number,
      default: 1,
    },
    availability: {
      type: String,
      enum: allowedAvailability,
      default: 'available',
    },
    ownerHostId: {
      type: String,
      default: '',
      trim: true,
    },
    ownerHostName: {
      type: String,
      default: '',
      trim: true,
    },
    reviews: {
      type: [
        new mongoose.Schema(
          {
            userId: { type: String, required: true, trim: true },
            userName: { type: String, required: true, trim: true },
            rating: { type: Number, required: true, min: 1, max: 5 },
            comment: { type: String, required: true, trim: true },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const HomeDocument = mongoose.models.Home || mongoose.model('Home', homeSchema, 'homes');

module.exports = class Home {
  constructor(
    houseName,
    price,
    location,
    rating,
    photo,
    homeType,
    maxGuests,
    availability,
    id = randomUUID(),
    isFavourite = false,
    ownerHostId = '',
    ownerHostName = '',
    reviews = []
  ) {
    this.id = id;
    this.houseName = houseName?.trim();
    this.price = price === '' || price === undefined || price === null ? null : Number(price);
    this.location = location?.trim();
    this.rating = rating === '' || rating === undefined || rating === null ? 0 : Number(rating);
    this.photo = photo?.trim();
    this.homeType = homeType?.trim();
    this.maxGuests = maxGuests === '' || maxGuests === undefined || maxGuests === null ? 1 : Number(maxGuests);
    this.availability = availability === 'unavailable' ? 'unavailable' : 'available';
    this.isFavourite = Boolean(isFavourite);
    this.ownerHostId = ownerHostId?.trim() || '';
    this.ownerHostName = ownerHostName?.trim() || '';
    this.reviews = Array.isArray(reviews)
      ? reviews.map((review) => ({
          userId: review.userId?.trim() || '',
          userName: review.userName?.trim() || 'Guest',
          rating: Number(review.rating) || 0,
          comment: review.comment?.trim() || '',
          createdAt: review.createdAt || new Date(),
          updatedAt: review.updatedAt || new Date(),
        }))
      : [];
    this.rating = Home.calculateAverageRating(this.reviews);
  }

  save(callback) {
    const homeDocument = new HomeDocument({
      id: this.id,
      houseName: this.houseName,
      price: this.price,
      location: this.location,
      rating: this.rating,
      photo: this.photo,
      homeType: this.homeType,
      maxGuests: this.maxGuests,
      availability: this.availability,
      ownerHostId: this.ownerHostId,
      ownerHostName: this.ownerHostName,
      reviews: this.reviews,
      isFavourite: this.isFavourite,
    });

    homeDocument
      .save()
      .then((savedHome) => callback(null, Home.normalizeHome(savedHome.toObject())))
      .catch((error) => callback(error));
  }

  static validate(homePayload) {
    const errors = [];
    const houseName = homePayload.houseName?.trim();
    const location = homePayload.location?.trim();
    const photo = homePayload.photo?.trim();
    const price = Number(homePayload.price);
    const rating =
      homePayload.rating === '' || homePayload.rating === undefined || homePayload.rating === null
        ? 0
        : Number(homePayload.rating);
    const maxGuests = Number(homePayload.maxGuests);

    if (!houseName) {
      errors.push('Home name is required.');
    } else if (houseName.length > 60) {
      errors.push('Home name must be 60 characters or fewer.');
    } else if (!textPattern.test(houseName)) {
      errors.push('Home name must contain real words and may only use letters, numbers, spaces, commas, periods, apostrophes, and hyphens.');
    }

    if (!location) {
      errors.push('Location is required.');
    } else if (!textPattern.test(location)) {
      errors.push('Location must contain place text and may only use letters, numbers, spaces, commas, periods, apostrophes, and hyphens.');
    }

    if (!Number.isFinite(price) || price <= 0) {
      errors.push('Price must be a positive number.');
    }

    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      errors.push('Rating must be between 0 and 5.');
    }

    if (!Number.isInteger(maxGuests) || maxGuests < 1 || maxGuests > 20) {
      errors.push('Max guests must be between 1 and 20.');
    }

    if (photo) {
      try {
        new URL(photo);
      } catch {
        errors.push('Photo URL must be a valid URL.');
      }
    }

    if (homePayload.homeType && !allowedHomeTypes.includes(homePayload.homeType)) {
      errors.push('Home type must be one of the available options.');
    }

    if (!allowedAvailability.includes(homePayload.availability)) {
      errors.push('Availability must be available or unavailable.');
    }

    return errors;
  }

  static normalizeHome(home) {
    const reviews = Array.isArray(home.reviews)
      ? home.reviews
          .map((review) => ({
            userId: review.userId?.trim() || '',
            userName: review.userName?.trim() || 'Guest',
            rating: Number(review.rating) || 0,
            comment: review.comment?.trim() || '',
            createdAt: review.createdAt || null,
            updatedAt: review.updatedAt || null,
          }))
          .filter((review) => review.userId && review.comment && review.rating > 0)
      : [];

    return {
      id: home.id || randomUUID(),
      houseName: home.houseName?.trim() || '',
      price: home.price === '' || home.price === undefined || home.price === null ? null : Number(home.price),
      location: home.location?.trim() || '',
      rating: Home.calculateAverageRating(reviews),
      photo: home.photo?.trim() || '',
      homeType: home.homeType?.trim() || '',
      maxGuests: home.maxGuests === '' || home.maxGuests === undefined || home.maxGuests === null ? 1 : Number(home.maxGuests),
      availability: home.availability === 'unavailable' ? 'unavailable' : 'available',
      ownerHostId: home.ownerHostId?.trim() || '',
      ownerHostName: home.ownerHostName?.trim() || '',
      reviews,
      reviewCount: reviews.length,
      isFavourite: Boolean(home.isFavourite),
    };
  }

  static calculateAverageRating(reviews) {
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return 0;
    }

    const total = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }

  static validateReview(reviewPayload) {
    const errors = [];
    const rating = Number(reviewPayload.rating);
    const comment = reviewPayload.comment?.trim();

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      errors.push('Review rating must be between 1 and 5.');
    }

    if (!comment) {
      errors.push('Review comment is required.');
    } else if (comment.length < 10) {
      errors.push('Review comment must be at least 10 characters long.');
    } else if (comment.length > 280) {
      errors.push('Review comment must be 280 characters or fewer.');
    } else if (!reviewTextPattern.test(comment)) {
      errors.push('Review comment must use readable text with standard punctuation.');
    }

    return errors;
  }

  static fetchAll(callback) {
    HomeDocument.find()
      .sort({ createdAt: 1, _id: 1 })
      .lean()
      .then((homes) => callback(null, homes.map((home) => Home.normalizeHome(home))))
      .catch((error) => callback(error));
  }

  static fetchByOwnerId(ownerHostId, callback) {
    HomeDocument.find({
      $or: [{ ownerHostId }, { ownerHostId: { $exists: false } }, { ownerHostId: '' }],
    })
      .sort({ createdAt: 1, _id: 1 })
      .lean()
      .then((homes) => callback(null, homes.map((home) => Home.normalizeHome(home))))
      .catch((error) => callback(error));
  }

  static fetchById(homeId, callback) {
    HomeDocument.findOne({ id: homeId })
      .lean()
      .then((home) => callback(null, home ? Home.normalizeHome(home) : null))
      .catch((error) => callback(error));
  }

  static updateFavouriteStatus(homeId, isFavourite, callback) {
    HomeDocument.findOneAndUpdate({ id: homeId }, { isFavourite: Boolean(isFavourite) }, { new: true })
      .lean()
      .then((home) => callback(null, home ? Home.normalizeHome(home) : null))
      .catch((error) => callback(error));
  }

  static updateById(homeId, homePayload, callback) {
    HomeDocument.findOne({ id: homeId })
      .lean()
      .then((existingHome) => {
        if (!existingHome) {
          callback(null, null);
          return null;
        }

        const updatedHome = new Home(
          homePayload.houseName,
          homePayload.price,
          homePayload.location,
          homePayload.rating,
          homePayload.photo,
          homePayload.homeType,
          homePayload.maxGuests,
          homePayload.availability,
          existingHome.id,
          existingHome.isFavourite,
          homePayload.ownerHostId || existingHome.ownerHostId,
          homePayload.ownerHostName || existingHome.ownerHostName,
          existingHome.reviews || []
        );

        return HomeDocument.findOneAndUpdate(
          { id: homeId },
          {
            houseName: updatedHome.houseName,
            price: updatedHome.price,
            location: updatedHome.location,
            rating: updatedHome.rating,
            photo: updatedHome.photo,
            homeType: updatedHome.homeType,
            maxGuests: updatedHome.maxGuests,
            availability: updatedHome.availability,
            ownerHostId: updatedHome.ownerHostId,
            ownerHostName: updatedHome.ownerHostName,
            reviews: updatedHome.reviews,
            rating: updatedHome.rating,
            isFavourite: updatedHome.isFavourite,
          },
          { new: true }
        )
          .lean()
          .then((home) => {
            callback(null, home ? Home.normalizeHome(home) : null);
          });
      })
      .catch((error) => callback(error));
  }

  static deleteById(homeId, callback) {
    HomeDocument.findOneAndDelete({ id: homeId })
      .lean()
      .then((deletedHome) => callback(null, deletedHome ? Home.normalizeHome(deletedHome) : null))
      .catch((error) => callback(error));
  }

  static addOrUpdateReview(homeId, reviewPayload, callback) {
    HomeDocument.findOne({ id: homeId })
      .then((homeDocument) => {
        if (!homeDocument) {
          callback(null, null);
          return null;
        }

        const currentReviews = Array.isArray(homeDocument.reviews) ? [...homeDocument.reviews] : [];
        const existingReviewIndex = currentReviews.findIndex((review) => review.userId === reviewPayload.userId);
        const nextReview = {
          userId: reviewPayload.userId,
          userName: reviewPayload.userName,
          rating: Number(reviewPayload.rating),
          comment: reviewPayload.comment.trim(),
          createdAt: existingReviewIndex >= 0 ? currentReviews[existingReviewIndex].createdAt || new Date() : new Date(),
          updatedAt: new Date(),
        };

        if (existingReviewIndex >= 0) {
          currentReviews[existingReviewIndex] = nextReview;
        } else {
          currentReviews.unshift(nextReview);
        }

        homeDocument.reviews = currentReviews;
        homeDocument.rating = Home.calculateAverageRating(currentReviews);

        return homeDocument.save().then((savedHome) => callback(null, Home.normalizeHome(savedHome.toObject())));
      })
      .catch((error) => callback(error));
  }
};
