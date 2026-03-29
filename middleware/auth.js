exports.requireLogin = (req, res, next) => {
  if (req.session?.isLoggedIn) {
    next();
    return;
  }

  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};

exports.requireGuestAccount = (req, res, next) => {
  if (!req.session?.isLoggedIn) {
    req.session.returnTo = req.originalUrl;
    res.redirect('/login');
    return;
  }

  if (req.session?.user?.userType === 'guest') {
    next();
    return;
  }

  res.redirect('/host/homes');
};

exports.requireHost = (req, res, next) => {
  if (req.session?.isLoggedIn && req.session?.user?.userType === 'host') {
    next();
    return;
  }

  res.redirect('/');
};
