const Home = require('../models/home');

const defaultFormData = {
  houseName: '',
  location: '',
  price: '',
  photo: '',
  rating: '0',
  homeType: '',
  maxGuests: '2',
  availability: 'available',
};

exports.getAddHome = (req, res) => {
  res.render('host/addHome', {
    errors: [],
    oldInput: defaultFormData,
  });
};

exports.postAddHome = (req, res, next) => {
  const validationErrors = Home.validate(req.body);

  if (validationErrors.length > 0) {
    res.status(422).render('host/addHome', {
      errors: validationErrors,
      oldInput: {
        houseName: req.body.houseName || '',
        location: req.body.location || '',
        price: req.body.price || '',
        photo: req.body.photo || '',
        rating: req.body.rating || '0',
        homeType: req.body.homeType || '',
        maxGuests: req.body.maxGuests || '2',
        availability: req.body.availability || 'available',
      },
    });
    return;
  }

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
    res.render('host/homeAdded', {
      houseName: savedHome.houseName,
      home: savedHome,
    });
  });
};

exports.getHostHomeList = (req, res, next) => {
  Home.fetchAll((error, homes) => {
    if (error) {
      next(error);
      return;
    }

    res.render('host/host-home-list', { homes });
  });
};

exports.getEditHome = (req, res, next) => {
  Home.fetchById(req.params.homeId, (error, home) => {
    if (error) {
      next(error);
      return;
    }

    if (!home) {
      res.status(404).render('404');
      return;
    }

    res.render('host/edit-home', { home });
  });
};
