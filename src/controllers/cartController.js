const httpStatus = require('http-status');

const Cart = require('../models/cartModel');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const helpers = require('../utils/helpers');

exports.getCart = catchAsync(async (req, res, next) => {
  // Get userId
  const { userId } = req.params;

  // check ownership
  const isOwner = helpers.checkOwnerShip(userId, req.user);

  if (isOwner) {
    const productPopulateConfig = {
      path: 'productIds',
      select: 'name slug category price id',
    };
    // Find cart with userId
    const cart = await Cart.findOne({ userId }).populate(productPopulateConfig);

    // if no cart found res with not found
    if (!cart) return next(new AppError('There is no cart found', httpStatus.NOT_FOUND));

    return res.status(httpStatus.OK).json({
      status: 'success',
      data: {
        cart,
      },
    });
  }
  next(new AppError("You are not allowed to see other's cart", httpStatus.FORBIDDEN));
});

exports.createAndUpdateCart = catchAsync(async (req, res, next) => {
  if (!req.body.userId) req.body.userId = req.params.userId;
  const filteredData = pick(req.body, Cart.schema.requiredPaths());

  // check ownership
  const isOwner = helpers.checkOwnerShip(filteredData.userId, req.user);

  if (isOwner) {
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

    const isProductAlreadyExists = cart.productIds.includes(filteredData.productIds);

    if (isProductAlreadyExists)
      return next(new AppError('This product is already in your cart.', httpStatus.BAD_REQUEST));

    // 2. If product not found, update the cart
    cart.productIds.unshift(filteredData.productIds);
    await cart.save();

    // 3. Send response
    return res.status(httpStatus.ACCEPTED).json({
      status: 'success',
      data: {
        cart,
      },
    });
  }

  next(new AppError('You are not allowed to update other cart.', httpStatus.FORBIDDEN));
});

exports.deleteCart = catchAsync(async (req, res, next) => {
  // Get userId
  const { userId } = req.params;

  // check ownership
  const isOwner = helpers.checkOwnerShip(userId, req.user);

  if (isOwner) {
    // Find cart with userId
    let cart = await Cart.findOne({ userId });

    //   1. If there is no cart send him not found request.
    if (!cart) return next(new AppError('There is no cart found.', httpStatus.NOT_FOUND));

    // Check the length of the cart.
    //  1. Delete the specific productId from productIds
    const deletingProductIndex = cart.productIds.findIndex((productId) => `${productId}` === req.body.productId);

    if (deletingProductIndex === -1)
      return next(new AppError('Product not found from the cart.', httpStatus.BAD_REQUEST));

    cart.productIds.splice(deletingProductIndex, 1);

    //  2. Check if the cart productIds length is >= 0 delete the entire cart or save the changes
    if (cart.productIds.length <= 0) cart = await Cart.findOneAndDelete({ userId });
    else await cart.save();

    //  3. Send response
    return res.status(httpStatus.ACCEPTED).json({
      status: 'success',
      message: 'Product removed from cart successfully.',
    });
  }

  next(new AppError("You are not allowed to delete other's cart.", httpStatus.FORBIDDEN));
});
