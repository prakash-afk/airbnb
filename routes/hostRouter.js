const express = require('express');
const hostController = require('../controllers/hostController');

const hostRouter = express.Router();

hostRouter.get('/host/add-home', hostController.getAddHome);
hostRouter.post('/host/add-home', hostController.postAddHome);
hostRouter.get('/host/homes', hostController.getHostHomeList);
hostRouter.get('/host/edit-home/:homeId', hostController.getEditHome);
hostRouter.post('/host/edit-home/:homeId', hostController.postEditHome);

module.exports = hostRouter;
