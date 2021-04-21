const express = require('express');

const authController = require('../../controllers/authController');
const wishListController = require('../../controllers/wishListController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(authController.restrictTo('user', 'admin'), wishListController.getWishList)
  .post(authController.restrictTo('user'), wishListController.createAndUpdateWishlist)
  .delete(authController.restrictTo('user'), wishListController.deleteWishList);

module.exports = router;
