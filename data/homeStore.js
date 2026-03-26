const registerHome = [];

function createHome(homePayload) {
  const newHome = {
    houseName: homePayload.houseName?.trim(),
    location: homePayload.location?.trim(),
    price: homePayload.price ? Number(homePayload.price) : null,
    photo: homePayload.photo?.trim(),
    rating: homePayload.rating ? Number(homePayload.rating) : 0,
    homeType: homePayload.homeType?.trim(),
    maxGuests: homePayload.maxGuests ? Number(homePayload.maxGuests) : 1,
  };

  registerHome.push(newHome);
  return newHome;
}

module.exports = {
  registerHome,
  createHome,
};
