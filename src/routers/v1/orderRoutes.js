const express = require('express');

const router = express.Router();
const nestedOrderRouter = express.Router({ mergeParams: true });

const authController = require('../../controllers/authController');
const orderController = require('../../controllers/orderController');

const checkAccessRight = require('../../middlewares/checkAccessRight');

// User routes
nestedOrderRouter.use(authController.protect);
nestedOrderRouter.use(authController.restrictTo('user'));

nestedOrderRouter.route('/').get(checkAccessRight, orderController.getAllUserOrder).post(orderController.createOrder);

nestedOrderRouter
  .route('/:orderId')
  .get(checkAccessRight, orderController.getOrder)
  .delete(checkAccessRight, orderController.deleteOrder);

router.use(authController.protect);
router.route('/').post(orderController.createOrder);

router.use(authController.restrictTo('admin'));

router.route('/').get(orderController.getAllOrders).patch(orderController.updateOrder);

module.exports = { nestedOrderRouter, router };
