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
      homes: homes.slice(0, 3),
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
