const express = require('express');
const userController = require('../controllers/userController');
const { requireGuestAccount } = require('../middleware/auth');

const userRouter = express.Router();

userRouter.get('/', userController.getHome);
userRouter.get('/homes/:homeId', userController.getHomeDetail);
userRouter.get('/favourites', requireGuestAccount, userController.getFavouriteList);
userRouter.get('/reserve/:homeId', userController.getReservePage);
userRouter.get('/bookings', requireGuestAccount, userController.getBookings);
userRouter.post('/favourites/:homeId', userController.toggleFavourite);

module.exports = userRouter;
