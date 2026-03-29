const Home = require('../models/home');
const User = require('../models/user');

function fetchAllHomes() {
  return new Promise((resolve, reject) => {
    Home.fetchAll((error, homes) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(homes);
    });
  });
}

function fetchHomeById(homeId) {
  return new Promise((resolve, reject) => {
    Home.fetchById(homeId, (error, home) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(home);
    });
  });
}

async function getCurrentUser(req) {
  if (!req.session?.user?.id) {
    return null;
  }

  return User.findById(req.session.user.id);
}

function attachFavouriteState(homes, currentUser) {
  const favouriteIds = new Set(currentUser?.favouriteHomeIds || []);
  return homes.map((home) => ({
    ...home,
    isFavourite: favouriteIds.has(home.id),
  }));
}

exports.getHome = async (req, res, next) => {
  try {
    const [registeredHomes, currentUser] = await Promise.all([fetchAllHomes(), getCurrentUser(req)]);
    res.render('store/home-list', { registerHome: attachFavouriteState(registeredHomes, currentUser) });
  } catch (error) {
    next(error);
  }
};

exports.getHomeDetail = async (req, res, next) => {
  try {
    const [home, currentUser] = await Promise.all([fetchHomeById(req.params.homeId), getCurrentUser(req)]);
    if (!home) {
      res.status(404).render('404');
      return;
    }

    const favouriteIds = new Set(currentUser?.favouriteHomeIds || []);
    res.render('store/home-detail', {
      home: {
        ...home,
        isFavourite: favouriteIds.has(home.id),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getFavouriteList = async (req, res, next) => {
  if (!req.session?.isLoggedIn) {
    req.session.returnTo = '/favourites';
    res.redirect('/login');
    return;
  }

  try {
    const [homes, currentUser] = await Promise.all([fetchAllHomes(), getCurrentUser(req)]);
    const favouriteIds = new Set(currentUser?.favouriteHomeIds || []);

    res.render('store/favourite-list', {
      homes: homes.filter((home) => favouriteIds.has(home.id)),
    });
  } catch (error) {
    next(error);
  }
};

exports.getReservePage = async (req, res, next) => {
  try {
    const home = await fetchHomeById(req.params.homeId);
    if (!home) {
      res.status(404).render('404');
      return;
    }

    res.render('store/reserve', { home });
  } catch (error) {
    next(error);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const homes = await fetchAllHomes();
    res.render('store/bookings', {
      homes: homes.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleFavourite = async (req, res, next) => {
  if (!req.session?.isLoggedIn || !req.session?.user?.id) {
    res.status(401).json({
      message: 'Login required to save favourites.',
      redirectTo: '/login',
    });
    return;
  }

  try {
    const home = await fetchHomeById(req.params.homeId);

    if (!home) {
      res.status(404).json({ message: 'Home not found.' });
      return;
    }

    const favouriteState = await User.toggleFavouriteHome(req.session.user.id, req.params.homeId);

    if (!favouriteState) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.status(200).json({
      message: favouriteState.isFavourite ? 'Added to favourites.' : 'Removed from favourites.',
      home: {
        ...home,
        isFavourite: favouriteState.isFavourite,
      },
    });
  } catch (error) {
    next(error);
  }
};
