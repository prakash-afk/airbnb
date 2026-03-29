const Home = require('../models/home');
const User = require('../models/user');
const { setFlash } = require('../utils/flash');

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

function getReviewDraftForUser(home, currentUser) {
  if (!currentUser || !Array.isArray(home?.reviews)) {
    return null;
  }

  return home.reviews.find((review) => review.userId === currentUser.id) || null;
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
      existingReview: getReviewDraftForUser(home, currentUser),
      reviewErrors: [],
      reviewFormData: {
        rating: '',
        comment: '',
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
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (currentUser.userType === 'host') {
      res.status(403).json({
        message: 'Favourites are available for guest accounts only.',
      });
      return;
    }

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

exports.postReview = async (req, res, next) => {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      setFlash(req, 'info', 'Please log in as a guest to leave a review.');
      res.redirect('/login');
      return;
    }

    if (currentUser.userType !== 'guest') {
      setFlash(req, 'info', 'Only guest accounts can submit reviews.');
      res.redirect(`/homes/${req.params.homeId}`);
      return;
    }

    const home = await fetchHomeById(req.params.homeId);

    if (!home) {
      res.status(404).render('404');
      return;
    }

    const reviewErrors = Home.validateReview(req.body);

    if (reviewErrors.length > 0) {
      const favouriteIds = new Set(currentUser?.favouriteHomeIds || []);
      res.status(422).render('store/home-detail', {
        home: {
          ...home,
          isFavourite: favouriteIds.has(home.id),
        },
        existingReview: getReviewDraftForUser(home, currentUser),
        reviewErrors,
        reviewFormData: {
          rating: req.body.rating || '',
          comment: req.body.comment || '',
        },
      });
      return;
    }

    Home.addOrUpdateReview(
      req.params.homeId,
      {
        userId: currentUser.id,
        userName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.email,
        rating: req.body.rating,
        comment: req.body.comment,
      },
      (error, updatedHome) => {
        if (error) {
          next(error);
          return;
        }

        if (!updatedHome) {
          res.status(404).render('404');
          return;
        }

        setFlash(req, 'info', 'Your review has been shared successfully.');
        res.redirect(`/homes/${updatedHome.id}`);
      }
    );
  } catch (error) {
    next(error);
  }
};
