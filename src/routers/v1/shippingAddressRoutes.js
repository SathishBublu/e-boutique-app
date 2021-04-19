const express = require('express');

const authController = require('../../controllers/authController');
const shippingAddressController = require('../../controllers/shippingAddressController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(authController.restrictTo('user', 'admin'), shippingAddressController.getShippingAddress)
  .post(authController.restrictTo('user'), shippingAddressController.createShippingAddress)
  .patch(authController.restrictTo('user'), shippingAddressController.updateShippingAddress)
  .delete(authController.restrictTo('user'), shippingAddressController.deleteShippingAddress);

router.route('/all').get(authController.restrictTo('admin'), shippingAddressController.getAllShippingAddress);
module.exports = router;
