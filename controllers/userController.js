const Home = require('../models/home');

exports.getHome = (req, res) => {
  const registeredHomes = Home.fetchAll();

  console.log('Registered Homes:', registeredHomes);
  res.render('home', { registerHome: registeredHomes });
};
