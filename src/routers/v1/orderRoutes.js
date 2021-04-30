const express = require('express');

const authController = require('../../controllers/authController');
const orderController = require('../../controllers/orderController');

const nestedOrderRouter = express.Router({ mergeParams: true });
const router = express.Router();

// User routes
nestedOrderRouter.use(authController.protect);
nestedOrderRouter.use(authController.restrictTo('user'));

nestedOrderRouter.route('/').get(orderController.getAllUserOrder).post(orderController.createOrder);

nestedOrderRouter.route('/:orderId').get(orderController.getOrder).delete(orderController.deleteOrder);

router.use(authController.protect);
router.route('/').post(orderController.createOrder);

// router.use();

router
  .route('/')
  .get(authController.restrictTo('admin'), orderController.getAllOrders)
  .patch(orderController.updateOrder);

module.exports = { nestedOrderRouter, router };
