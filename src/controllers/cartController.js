const httpStatus = require('http-status');

const Cart = require('../models/cartModel');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

exports.getCart = catchAsync(async (req, res, next) => {
  // Get userId
  const { userId } = req.params;

  const productPopulateConfig = {
    path: 'products',
    populate: {
      path: 'productId',
      select: 'name slug category price id stocks',
    },
  };
  // Find cart with userId
  const cart = await Cart.findOne({ userId }).populate(productPopulateConfig);

  // if no cart found res with not found
  if (!cart) return next('There is no cart items found. Please add some products :D.', httpStatus.NOT_FOUND);

  res.status(httpStatus.OK).json({
    status: 'success',
    results: cart.products.length,
    data: {
      cart,
    },
  });
});

exports.createCart = catchAsync(async (req, res, next) => {
  if (!req.body.userId) req.body.userId = req.params.userId;
  const filteredData = pick(req.body, Cart.schema.requiredPaths());

  // check if there is already an cart by userId
  const cart = await Cart.findOne({ userId: filteredData.userId });

  // If not create new cart
  if (!cart) {
    const newCart = await Cart.create(filteredData);

    return res.status(httpStatus.CREATED).json({
      status: 'success',
      data: {
        cart: newCart,
      },
    });
  }

  // If cart by userId exists update the cart
  // 1. Check the product if it's already exists

  const existsProductIds = cart.products.map((product) => `${product.productId}`);

  const isProductAlreadyExists = existsProductIds.includes(filteredData.products.productId);

  if (isProductAlreadyExists)
    return next(new AppError('This product is already in your cart.', httpStatus.BAD_REQUEST));

  // 2. If product not found, update the cart
  cart.products.unshift(filteredData.products);
  await cart.save();

  // 3. Send response
  res.status(httpStatus.ACCEPTED).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

exports.updateCart = catchAsync(async (req, res, next) => {
  if (!req.body.userId) req.body.userId = req.params.userId;

  // check if there is already an cart by userId
  const cart = await Cart.findOne({ userId: req.body.userId });

  // If not response with error code
  if (!cart) {
    return next(new AppError('No cart found', httpStatus.NOT_FOUND));
  }

  // Update the cart by the details
  const updatingProductIndex = cart.products.findIndex((product) => `${product.productId}` === req.body.productId);
  cart.products[updatingProductIndex].size = req.body.size || cart.products[updatingProductIndex].size;
  cart.products[updatingProductIndex].placedItems =
    req.body.placedItems || cart.products[updatingProductIndex].placedItems;
  await cart.save();

  res.status(httpStatus.ACCEPTED).json({
    status: 'success',
    message: 'Cart item updated.',
  });
});

exports.deleteCart = catchAsync(async (req, res, next) => {
  // Get userId
  const { userId } = req.params;

  // Find cart with userId
  let cart = await Cart.findOne({ userId });

  //   1. If there is no cart send him not found request.
  if (!cart) return next(new AppError('There is no cart found.', httpStatus.NOT_FOUND));

  // Check the length of the cart.
  //  1. Delete the specific productId from productIds

  const deletingProductIndex = cart.products.findIndex((product) => `${product.productId}` === req.body.productId);

  if (deletingProductIndex === -1)
    return next(new AppError('Product not found from the cart.', httpStatus.BAD_REQUEST));

  cart.products.splice(deletingProductIndex, 1);

  //  2. Check if the cart products length is >= 0 delete the entire cart or save the changes
  if (cart.products.length <= 0) cart = await Cart.findOneAndDelete({ userId });
  else await cart.save();

  //  3. Send response
  res.status(httpStatus.ACCEPTED).json({
    status: 'success',
    message: 'Product removed from cart successfully.',
  });
});
