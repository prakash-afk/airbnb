const express = require('express');
const { registerHome } = require('../data/homeStore');

const userRouter = express.Router();

userRouter.get('/', (req, res) => {
  console.log('Registered Homes:', registerHome);
  res.render('home', { registerHome });
});

module.exports = userRouter;
