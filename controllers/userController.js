const Home = require('../models/home');

exports.getHome = (req, res, next) => {
  Home.fetchAll((error, registeredHomes) => {
    if (error) {
      next(error);
      return;
    }

    console.log('Registered Homes:', registeredHomes);
    res.render('home', { registerHome: registeredHomes });
  });
};
