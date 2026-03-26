const express = require('express');

const hostRouter = express.Router();
const registerHome = [];

hostRouter.get('/host/add-home', (req, res) => {
  res.render('addHome');
});

hostRouter.post('/host/add-home', (req, res) => {
  const newHome = {
    houseName: req.body.houseName?.trim(),
    location: req.body.location?.trim(),
    price: req.body.price ? Number(req.body.price) : null,
    photo: req.body.photo?.trim(),
    rating: req.body.rating ? Number(req.body.rating) : 0,
    homeType: req.body.homeType?.trim(),
    maxGuests: req.body.maxGuests ? Number(req.body.maxGuests) : 1,
  };

  console.log('Home registered successfully:', newHome);
  registerHome.push(newHome);

  res.render('homeAdded', { houseName: newHome.houseName });
});

module.exports = hostRouter;
module.exports.registerHome = registerHome;
