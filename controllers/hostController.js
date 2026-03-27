const Home = require('../models/home');

exports.getAddHome = (req, res) => {
  res.render('addHome');
};

exports.postAddHome = (req, res) => {
  const newHome = new Home(
    req.body.houseName,
    req.body.price,
    req.body.location,
    req.body.rating,
    req.body.photo,
    req.body.homeType,
    req.body.maxGuests,
    req.body.availability
  ).save();

  console.log('Home registered successfully:', newHome);
  res.render('homeAdded', {
    houseName: newHome.houseName,
    home: newHome,
  });
};
