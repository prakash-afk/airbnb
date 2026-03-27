const registeredHomes = [];

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

  save() {
    registeredHomes.push(this);
    return this;
  }

  static fetchAll() {
    return registeredHomes;
  }
};
