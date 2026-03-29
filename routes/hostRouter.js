const express = require('express');
const hostController = require('../controllers/hostController');
const { requireLogin, requireHost } = require('../middleware/auth');

const hostRouter = express.Router();

hostRouter.use(requireLogin);
hostRouter.use(requireHost);

hostRouter.get('/host/add-home', hostController.getAddHome);
hostRouter.post('/host/add-home', hostController.postAddHome);
hostRouter.get('/host/homes', hostController.getHostHomeList);
hostRouter.get('/host/edit-home/:homeId', hostController.getEditHome);
hostRouter.post('/host/edit-home/:homeId', hostController.postEditHome);
hostRouter.get('/host/delete-home/:homeId', hostController.getDeleteHomeFallback);
hostRouter.post('/host/delete-home/:homeId', hostController.postDeleteHome);

module.exports = hostRouter;
