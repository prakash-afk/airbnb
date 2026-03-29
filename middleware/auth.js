exports.requireLogin = (req, res, next) => {
  if (req.session?.isLoggedIn) {
    next();
    return;
  }

  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};

exports.requireHost = (req, res, next) => {
  if (req.session?.isLoggedIn && req.session?.user?.userType === 'host') {
    next();
    return;
  }

  res.redirect('/');
};
