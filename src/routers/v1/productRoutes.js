const express = require('express');

const router = express.Router();
const productController = require('../../controllers/productController');
const authController = require('../../controllers/authController');

const reviewRoutes = require('./reviewRoutes');

// review router ( nested params )
router.use('/:productId/reviews', reviewRoutes);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(authController.protect, authController.restrictTo('admin'), productController.createProduct);

router.use(authController.protect);

router
  .route('/:id')
  .get(authController.restrictTo('user', 'admin'), productController.getProduct)
  .patch(authController.restrictTo('admin'), productController.updateProduct)
  .delete(authController.restrictTo('admin'), productController.deleteProduct);

module.exports = router;
