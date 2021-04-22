const express = require('express');

const authController = require('../../controllers/authController');
const cartController = require('../../controllers/cartController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router.use(authController.restrictTo('user'));

router
  .route('/')
  .get(cartController.getCart)
  .post(cartController.createAndUpdateCart)
  .delete(cartController.deleteCart);

module.exports = router;
