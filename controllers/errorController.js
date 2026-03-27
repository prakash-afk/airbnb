exports.get404 = (req, res) => {
  res.status(404).render('404');
};

exports.get500 = (error, req, res, next) => {
  console.error('Application error:', error.message);

  res.status(500).render('500', {
    pageTitle: 'Something Went Wrong',
    errorMessage: error.message || 'Something went wrong while processing your request.',
  });
};
