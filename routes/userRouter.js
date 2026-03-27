const express = require('express');
const userController = require('../controllers/userController');

const userRouter = express.Router();

userRouter.get('/', userController.getHome);
userRouter.get('/homes/:homeId', userController.getHomeDetail);
userRouter.get('/favourites', userController.getFavouriteList);
userRouter.get('/reserve/:homeId', userController.getReservePage);
userRouter.get('/bookings', userController.getBookings);

module.exports = userRouter;
