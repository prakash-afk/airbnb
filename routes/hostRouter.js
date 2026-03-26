const express = require('express');
const hostController = require('../controllers/hostController');

const hostRouter = express.Router();

hostRouter.get('/host/add-home', hostController.getAddHome);
hostRouter.post('/host/add-home', hostController.postAddHome);

module.exports = hostRouter;
