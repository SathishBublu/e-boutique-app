const express = require('express');

const router = express.Router();
const productController = require('../../controllers/productController');
const authController = require('../../controllers/authController');

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
