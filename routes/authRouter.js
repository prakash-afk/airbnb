const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/authController');
const User = require('../models/user');

const authRouter = express.Router();

const signupValidators = [
  body('firstName').trim().notEmpty().withMessage('First name is required.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Enter a valid email address.')
    .bail()
    .custom(async (email) => {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new Error('That email is already registered.');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Confirm password must match password.'),
  body('userType')
    .isIn(['guest', 'host'])
    .withMessage('Choose whether you are signing up as a guest or a host.'),
  body('terms')
    .equals('on')
    .withMessage('You must accept the terms and conditions.'),
];

const loginValidators = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

authRouter.get('/login', authController.getLogin);
authRouter.post('/login', loginValidators, authController.postLogin);
authRouter.get('/signup', authController.getSignup);
authRouter.post('/signup', signupValidators, authController.postSignup);
authRouter.post('/logout', authController.postLogout);

module.exports = authRouter;
