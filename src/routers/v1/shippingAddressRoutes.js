const express = require('express');

const authController = require('../../controllers/authController');
const shippingAddressController = require('../../controllers/shippingAddressController');

const checkAccessRight = require('../../middlewares/checkAccessRight');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(authController.restrictTo('user', 'admin'), checkAccessRight, shippingAddressController.getShippingAddress)
  .post(authController.restrictTo('user'), checkAccessRight, shippingAddressController.createShippingAddress)
  .patch(authController.restrictTo('user'), checkAccessRight, shippingAddressController.updateShippingAddress)
  .delete(authController.restrictTo('user'), checkAccessRight, shippingAddressController.deleteShippingAddress);

router.route('/all').get(authController.restrictTo('admin'), shippingAddressController.getAllShippingAddress);
module.exports = router;
