const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/user');

function buildLoginInput(body = {}) {
  return {
    email: body.email || '',
  };
}

function buildSignupInput(body = {}) {
  return {
    firstName: body.firstName || '',
    lastName: body.lastName || '',
    email: body.email || '',
    userType: body.userType || 'guest',
    terms: body.terms ? 'on' : '',
  };
}

exports.getLogin = (req, res) => {
  if (req.session?.isLoggedIn) {
    res.redirect(req.session.user?.userType === 'host' ? '/host/homes' : '/');
    return;
  }

  res.render('auth/login', {
    pageTitle: 'Login',
    errors: [],
    oldInput: buildLoginInput(),
  });
};

exports.getSignup = (req, res) => {
  if (req.session?.isLoggedIn) {
    res.redirect(req.session.user?.userType === 'host' ? '/host/homes' : '/');
    return;
  }

  res.render('auth/signup', {
    pageTitle: 'Sign Up',
    errors: [],
    oldInput: buildSignupInput(),
  });
};

exports.postSignup = async (req, res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    res.status(422).render('auth/signup', {
      pageTitle: 'Sign Up',
      errors: validationErrors.array().map((error) => error.msg),
      oldInput: buildSignupInput(req.body),
    });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    await User.create({
      firstName: req.body.firstName?.trim(),
      lastName: req.body.lastName?.trim(),
      email: req.body.email?.trim().toLowerCase(),
      password: hashedPassword,
      userType: req.body.userType,
      favouriteHomeIds: [],
    });

    res.redirect('/login');
  } catch (error) {
    next(error);
  }
};

exports.postLogin = async (req, res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    res.status(422).render('auth/login', {
      pageTitle: 'Login',
      errors: validationErrors.array().map((error) => error.msg),
      oldInput: buildLoginInput(req.body),
    });
    return;
  }

  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password || '';
    const user = await User.findByEmail(email);

    if (!user) {
      res.status(422).render('auth/login', {
        pageTitle: 'Login',
        errors: ['No account found with that email address.'],
        oldInput: buildLoginInput(req.body),
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      res.status(422).render('auth/login', {
        pageTitle: 'Login',
        errors: ['Incorrect password. Please try again.'],
        oldInput: buildLoginInput(req.body),
      });
      return;
    }

    req.session.isLoggedIn = true;
    req.session.user = {
      id: user.id,
      email: user.email,
      displayName: `${user.firstName} ${user.lastName}`.trim(),
      userType: user.userType,
    };

    req.session.save(() => {
      const returnTo = req.session.returnTo;
      delete req.session.returnTo;
      res.redirect(returnTo || (user.userType === 'host' ? '/host/homes' : '/'));
    });
  } catch (error) {
    next(error);
  }
};

exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('airbnb.sid');
    res.redirect('/login');
  });
};
