const express = require('express');

const router = express.Router({ mergeParams: true });

const authController = require('../../controllers/authController');
const cartController = require('../../controllers/cartController');

const checkAccessRight = require('../../middlewares/checkAccessRight');

router.use(authController.protect);
router.use(authController.restrictTo('user'));

router
  .route('/')
  .get(checkAccessRight, cartController.getCart)
  .post(checkAccessRight, cartController.createCart)
  .patch(checkAccessRight, cartController.updateCart)
  .delete(checkAccessRight, cartController.deleteCart);

module.exports = router;
