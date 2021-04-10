const httpStatus = require('http-status');
const slugify = require('slugify');

const Product = require('../models/productModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find();

  res.status(httpStatus.OK).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found.', httpStatus.NOT_FOUND));
  }

  res.status(httpStatus.OK).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(httpStatus.CREATED).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.updateProduct = async (req, res, next) => {
  if (req.body.name) req.body.slug = slugify(req.body.name, { lower: true, strict: true });

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError('No product found with that ID', httpStatus.NOT_FOUND));
  }

  res.status(httpStatus.OK).json({
    status: 'success',
    message: 'Product updated successfully.',
    data: {
      product,
    },
  });
};

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', httpStatus.NOT_FOUND));
  }

  res.status(httpStatus.ACCEPTED).json({
    status: 'success',
    message: 'Product deleted successfully.',
    data: {},
  });
});
