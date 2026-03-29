const { setFlash } = require('../utils/flash');

exports.requireLogin = (req, res, next) => {
  if (req.session?.isLoggedIn) {
    next();
    return;
  }

  req.session.returnTo = req.originalUrl;
  setFlash(req, 'info', 'Please log in to continue.');
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

  setFlash(req, 'info', 'This page is available for guest accounts only.');
  res.redirect('/host/homes');
};

exports.requireHost = (req, res, next) => {
  if (req.session?.isLoggedIn && req.session?.user?.userType === 'host') {
    next();
    return;
  }

  setFlash(req, 'info', 'Host access is required for that page.');
  res.redirect('/');
};
