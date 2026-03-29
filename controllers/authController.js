const demoCredentials = {
  email: process.env.DEMO_LOGIN_EMAIL || 'host@airbnb.dev',
  password: process.env.DEMO_LOGIN_PASSWORD || 'airbnb123',
};

function buildLoginInput(body = {}) {
  return {
    email: body.email || '',
  };
}

exports.getLogin = (req, res) => {
  if (req.session?.isLoggedIn) {
    res.redirect('/host/homes');
    return;
  }

  res.render('auth/login', {
    pageTitle: 'Login',
    errors: [],
    oldInput: buildLoginInput(),
    demoCredentials: {
      email: demoCredentials.email,
      password: demoCredentials.password,
    },
  });
};

exports.postLogin = (req, res) => {
  const email = req.body.email?.trim() || '';
  const password = req.body.password || '';
  const errors = [];

  if (!email) {
    errors.push('Email is required.');
  }

  if (!password) {
    errors.push('Password is required.');
  }

  if (errors.length === 0) {
    const isValidLogin = email === demoCredentials.email && password === demoCredentials.password;

    if (!isValidLogin) {
      errors.push('Invalid email or password. Use the demo credentials shown below.');
    }
  }

  if (errors.length > 0) {
    res.status(422).render('auth/login', {
      pageTitle: 'Login',
      errors,
      oldInput: buildLoginInput(req.body),
      demoCredentials: {
        email: demoCredentials.email,
        password: demoCredentials.password,
      },
    });
    return;
  }

  req.session.isLoggedIn = true;
  req.session.user = {
    email,
    displayName: email.split('@')[0],
  };

  req.session.save(() => {
    const returnTo = req.session.returnTo;
    delete req.session.returnTo;
    res.redirect(returnTo || '/host/homes');
  });
};

exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('airbnb.sid');
    res.redirect('/login');
  });
};
