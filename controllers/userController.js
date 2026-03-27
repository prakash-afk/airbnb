const Home = require('../models/home');

exports.getHome = (req, res, next) => {
  Home.fetchAll((error, registeredHomes) => {
    if (error) {
      next(error);
      return;
    }

    console.log('Registered Homes:', registeredHomes);
    res.render('store/home-list', { registerHome: registeredHomes });
  });
};

exports.getHomeDetail = (req, res, next) => {
  Home.fetchById(req.params.homeId, (error, home) => {
    if (error) {
      next(error);
      return;
    }

    if (!home) {
      res.status(404).render('404');
      return;
    }

    res.render('store/home-detail', { home });
  });
};

exports.getFavouriteList = (req, res, next) => {
  Home.fetchAll((error, homes) => {
    if (error) {
      next(error);
      return;
    }

    res.render('store/favourite-list', {
      homes: homes.filter((home) => home.isFavourite),
    });
  });
};

exports.getReservePage = (req, res, next) => {
  Home.fetchById(req.params.homeId, (error, home) => {
    if (error) {
      next(error);
      return;
    }

    if (!home) {
      res.status(404).render('404');
      return;
    }

    res.render('store/reserve', { home });
  });
};

exports.getBookings = (req, res, next) => {
  Home.fetchAll((error, homes) => {
    if (error) {
      next(error);
      return;
    }

    res.render('store/bookings', {
      homes: homes.slice(0, 5),
    });
  });
};

exports.toggleFavourite = (req, res, next) => {
  Home.updateFavouriteStatus(req.params.homeId, req.body.isFavourite, (error, home) => {
    if (error) {
      next(error);
      return;
    }

    if (!home) {
      res.status(404).json({ message: 'Home not found.' });
      return;
    }

    res.status(200).json({
      message: 'Favourite status updated.',
      home,
    });
  });
};
