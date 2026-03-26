const { createHome } = require('../data/homeStore');

exports.getAddHome = (req, res) => {
  res.render('addHome');
};

exports.postAddHome = (req, res) => {
  const newHome = createHome(req.body);

  console.log('Home registered successfully:', newHome);
  res.render('homeAdded', { houseName: newHome.houseName });
};
