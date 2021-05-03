const express = require('express');

const authController = require('../../controllers/authController');
const wishListController = require('../../controllers/wishListController');

const checkAccessRight = require('../../middlewares/checkAccessRight');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(authController.restrictTo('user', 'admin'), checkAccessRight, wishListController.getWishList)
  .post(authController.restrictTo('user'), checkAccessRight, wishListController.createAndUpdateWishlist)
  .delete(authController.restrictTo('user'), checkAccessRight, wishListController.deleteWishList);

module.exports = router;
