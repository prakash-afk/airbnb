exports.requireLogin = (req, res, next) => {
  if (req.session?.isLoggedIn) {
    next();
    return;
  }

  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};
