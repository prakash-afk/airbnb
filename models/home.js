const fs = require('fs');
const path = require('path');

const homesDataPath = path.join(__dirname, '..', 'data', 'homes.json');

module.exports = class Home {
  constructor(houseName, price, location, rating, photo, homeType, maxGuests, availability) {
    this.houseName = houseName?.trim();
    this.price = price ? Number(price) : null;
    this.location = location?.trim();
    this.rating = rating ? Number(rating) : 0;
    this.photo = photo?.trim();
    this.homeType = homeType?.trim();
    this.maxGuests = maxGuests ? Number(maxGuests) : 1;
    this.availability = availability === 'unavailable' ? 'unavailable' : 'available';
  }

  save(callback) {
    Home.fetchAll((readError, registeredHomes) => {
      if (readError) {
        callback(readError);
        return;
      }

      registeredHomes.push(this);

      fs.mkdir(path.dirname(homesDataPath), { recursive: true }, (mkdirError) => {
        if (mkdirError) {
          callback(mkdirError);
          return;
        }

        fs.writeFile(homesDataPath, JSON.stringify(registeredHomes, null, 2), (writeError) => {
          if (writeError) {
            callback(writeError);
            return;
          }

          callback(null, this);
        });
      });
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
        callback(null, Array.isArray(homes) ? homes : []);
      } catch (parseError) {
        const invalidJsonError = new Error('Could not read saved homes because homes.json contains invalid JSON.');
        invalidJsonError.cause = parseError;
        callback(invalidJsonError);
      }
    });
  }
};
