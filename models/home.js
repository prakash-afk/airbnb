const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const homesDataPath = path.join(__dirname, '..', 'data', 'homes.json');

module.exports = class Home {
  constructor(houseName, price, location, rating, photo, homeType, maxGuests, availability, id = randomUUID(), isFavourite = false) {
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
  }

  save(callback) {
    Home.fetchAll((readError, registeredHomes) => {
      if (readError) {
        callback(readError);
        return;
      }

      registeredHomes.push(this);
      Home.writeAll(registeredHomes, (writeError) => {
        if (writeError) {
          callback(writeError);
          return;
        }

        callback(null, this);
      });
    });
  }

  static validate(homePayload) {
    const errors = [];
    const houseName = homePayload.houseName?.trim();
    const location = homePayload.location?.trim();
    const photo = homePayload.photo?.trim();
    const price = Number(homePayload.price);
    const rating = Number(homePayload.rating);
    const maxGuests = Number(homePayload.maxGuests);
    const allowedHomeTypes = ['House', 'Apartment', 'Cabin', 'Beach House', 'Farm', 'Villa'];
    const allowedAvailability = ['available', 'unavailable'];
    const textPattern = /^(?=.*[A-Za-z])[A-Za-z0-9\s,.'-]+$/;

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
    return {
      id: home.id || randomUUID(),
      houseName: home.houseName?.trim() || '',
      price: home.price === '' || home.price === undefined || home.price === null ? null : Number(home.price),
      location: home.location?.trim() || '',
      rating: home.rating === '' || home.rating === undefined || home.rating === null ? 0 : Number(home.rating),
      photo: home.photo?.trim() || '',
      homeType: home.homeType?.trim() || '',
      maxGuests: home.maxGuests === '' || home.maxGuests === undefined || home.maxGuests === null ? 1 : Number(home.maxGuests),
      availability: home.availability === 'unavailable' ? 'unavailable' : 'available',
      isFavourite: Boolean(home.isFavourite),
    };
  }

  static writeAll(homes, callback) {
    fs.mkdir(path.dirname(homesDataPath), { recursive: true }, (mkdirError) => {
      if (mkdirError) {
        callback(mkdirError);
        return;
      }

      fs.writeFile(homesDataPath, JSON.stringify(homes, null, 2), callback);
    });
  }

  static fetchAll(callback) {
    fs.readFile(homesDataPath, 'utf8', (error, fileContent) => {
      if (error) {
        if (error.code === 'ENOENT') {
          callback(null, []);
          return;
        }

        callback(error);
        return;
      }

      if (!fileContent.trim()) {
        callback(null, []);
        return;
      }

      try {
        const homes = JSON.parse(fileContent);
        const normalizedHomes = Array.isArray(homes) ? homes.map((home) => Home.normalizeHome(home)) : [];
        const needsRewrite = normalizedHomes.some((home, index) => !homes[index]?.id);

        if (!needsRewrite) {
          callback(null, normalizedHomes);
          return;
        }

        Home.writeAll(normalizedHomes, (writeError) => {
          if (writeError) {
            callback(writeError);
            return;
          }

          callback(null, normalizedHomes);
        });
      } catch (parseError) {
        const invalidJsonError = new Error('Could not read saved homes because homes.json contains invalid JSON.');
        invalidJsonError.cause = parseError;
        callback(invalidJsonError);
      }
    });
  }

  static fetchById(homeId, callback) {
    Home.fetchAll((error, homes) => {
      if (error) {
        callback(error);
        return;
      }

      const home = homes.find((item) => item.id === homeId) || null;
      callback(null, home);
    });
  }

  static updateFavouriteStatus(homeId, isFavourite, callback) {
    Home.fetchAll((error, homes) => {
      if (error) {
        callback(error);
        return;
      }

      const homeIndex = homes.findIndex((item) => item.id === homeId);
      if (homeIndex === -1) {
        callback(null, null);
        return;
      }

      homes[homeIndex].isFavourite = Boolean(isFavourite);

      Home.writeAll(homes, (writeError) => {
        if (writeError) {
          callback(writeError);
          return;
        }

        callback(null, homes[homeIndex]);
      });
    });
  }

  static updateById(homeId, homePayload, callback) {
    Home.fetchAll((error, homes) => {
      if (error) {
        callback(error);
        return;
      }

      const homeIndex = homes.findIndex((item) => item.id === homeId);
      if (homeIndex === -1) {
        callback(null, null);
        return;
      }

      const existingHome = homes[homeIndex];
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
        existingHome.isFavourite
      );

      homes[homeIndex] = updatedHome;

      Home.writeAll(homes, (writeError) => {
        if (writeError) {
          callback(writeError);
          return;
        }

        callback(null, updatedHome);
      });
    });
  }
};
