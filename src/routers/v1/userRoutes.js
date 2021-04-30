const express = require('express');

const router = express.Router();
const userController = require('../../controllers/userController');
const authController = require('../../controllers/authController');

const shippingAddressRoutes = require('./shippingAddressRoutes');
const wishListRoutes = require('./wishListRoutes');
const cartRoutes = require('./cartRoutes');
const { nestedOrderRouter: orderRoutes } = require('./orderRoutes');

// Nested routes
router.use('/:userId/shipping-address', shippingAddressRoutes);
router.use('/:userId/wishlist', wishListRoutes);
router.use('/:userId/cart', cartRoutes);
router.use('/:userId/orders', orderRoutes);

// User routes
router.use(authController.protect);

router.patch('/update-my-Password', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/update-me', userController.updateMe);
router.delete('/delete-me', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router.route('/:id').get(userController.getUser);

router.route('/').get(userController.getAllUsers).post(userController.createUser);

router.route('/:id').patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
