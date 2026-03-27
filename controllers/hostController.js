const Home = require('../models/home');

exports.getAddHome = (req, res) => {
  res.render('addHome');
};

exports.postAddHome = (req, res, next) => {
  const newHome = new Home(
    req.body.houseName,
    req.body.price,
    req.body.location,
    req.body.rating,
    req.body.photo,
    req.body.homeType,
    req.body.maxGuests,
    req.body.availability
  );

  newHome.save((error, savedHome) => {
    if (error) {
      next(error);
      return;
    }

    console.log('Home registered successfully:', savedHome);
    res.render('homeAdded', {
      houseName: savedHome.houseName,
      home: savedHome,
    });
  });
};
