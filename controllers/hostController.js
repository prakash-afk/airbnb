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

function buildFormData(body) {
  return {
    houseName: body.houseName || '',
    location: body.location || '',
    price: body.price || '',
    photo: body.photo || '',
    rating: body.rating || '0',
    homeType: body.homeType || '',
    maxGuests: body.maxGuests || '2',
    availability: body.availability || 'available',
  };
}

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
      oldInput: buildFormData(req.body),
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

    res.render('host/edit-home', {
      home,
      errors: [],
      oldInput: buildFormData(home),
    });
  });
};

exports.postEditHome = (req, res, next) => {
  const validationErrors = Home.validate(req.body);

  if (validationErrors.length > 0) {
    Home.fetchById(req.params.homeId, (error, home) => {
      if (error) {
        next(error);
        return;
      }

      if (!home) {
        res.status(404).render('404');
        return;
      }

      res.status(422).render('host/edit-home', {
        home,
        errors: validationErrors,
        oldInput: buildFormData(req.body),
      });
    });
    return;
  }

  Home.updateById(req.params.homeId, req.body, (error, updatedHome) => {
    if (error) {
      next(error);
      return;
    }

    if (!updatedHome) {
      res.status(404).render('404');
      return;
    }

    res.redirect(`/homes/${updatedHome.id}`);
  });
};

exports.postDeleteHome = (req, res, next) => {
  Home.deleteById(req.params.homeId, (error, deletedHome) => {
    if (error) {
      next(error);
      return;
    }

    if (!deletedHome) {
      res.status(200).json({
        message: 'Home was already removed.',
        redirectTo: '/host/homes',
      });
      return;
    }

    res.status(200).json({
      message: 'Home deleted successfully.',
      redirectTo: '/host/homes',
    });
  });
};

exports.getDeleteHomeFallback = (req, res) => {
  res.redirect(303, '/host/homes');
};
