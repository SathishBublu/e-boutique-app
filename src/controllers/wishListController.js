const httpStatus = require('http-status');

const WishList = require('../models/wishListModel');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const helpers = require('../utils/helpers');

exports.getWishList = catchAsync(async (req, res, next) => {
  // Get userId
  const { userId } = req.params;

  // check ownership
  const isOwner = helpers.checkOwnerShip(userId, req.user);

  if (isOwner) {
    const productPopulateConfig = {
      path: 'productIds',
      select: 'name slug category price id',
    };
    // Find wishlist with userId
    const wishLists = await WishList.findOne({ userId }).populate(productPopulateConfig);

    // if no wishlist found res with not found
    if (!wishLists) return next(new AppError('There is no wish lists found', httpStatus.NOT_FOUND));

    return res.status(httpStatus.OK).json({
      status: 'success',
      data: {
        wishLists,
      },
    });
  }
  next(new AppError("You are not allowed to see other's wish lists", httpStatus.FORBIDDEN));
});

exports.createAndUpdateWishlist = catchAsync(async (req, res, next) => {
  if (!req.body.userId) req.body.userId = req.params.userId;
  const filteredData = pick(req.body, WishList.schema.requiredPaths());

  // check ownership
  const isOwner = helpers.checkOwnerShip(filteredData.userId, req.user);

  if (isOwner) {
    // check if there is already an wishlist by userId
    const wishLists = await WishList.findOne({ userId: filteredData.userId });

    // If not create new wishlist
    if (!wishLists) {
      const newWishList = await WishList.create(filteredData);

      return res.status(httpStatus.CREATED).json({
        status: 'success',
        data: {
          wishLists: newWishList,
        },
      });
    }

    // If wishlist by userId exists update the wishlist
    // 1. Check the product if it's already exists

    const isProductAlreadyExists = wishLists.productIds.includes(filteredData.productIds);

    if (isProductAlreadyExists)
      return next(new AppError('This product is already in your wish list.', httpStatus.BAD_REQUEST));

    // 2. If product not found, update the wish list
    wishLists.productIds.unshift(filteredData.productIds);
    await wishLists.save();

    // 3. Send response
    return res.status(httpStatus.ACCEPTED).json({
      status: 'success',
      data: {
        wishLists,
      },
    });
  }

  next(new AppError('You are not allowed to update other wish lists.', httpStatus.FORBIDDEN));
});

exports.deleteWishList = catchAsync(async (req, res, next) => {
  // Get userId
  const { userId } = req.params;

  // check ownership
  const isOwner = helpers.checkOwnerShip(userId, req.user);

  if (isOwner) {
    // Find wishlist with userId
    let wishLists = await WishList.findOne({ userId });

    //   1. If there is no wishlist send him not found request. This might be not needed I implemented for developer experience :D
    if (!wishLists) return next(new AppError('There is no wish lists found.', httpStatus.NOT_FOUND));

    // Check the length of the wishlist.
    //  1. Delete the specific productId from productIds
    const deletingProductIndex = wishLists.productIds.findIndex((productId) => `${productId}` === req.body.productId);

    if (deletingProductIndex === -1)
      return next(new AppError('Product not found from the wish lists.', httpStatus.BAD_REQUEST));

    wishLists.productIds.splice(deletingProductIndex, 1);

    //  2. Check if the wishlist productIds length is >= 0 delete the entire wishlist or save the changes
    if (wishLists.productIds.length <= 0) wishLists = await WishList.findOneAndDelete({ userId });
    else await wishLists.save();

    //  3. Send response
    return res.status(httpStatus.ACCEPTED).json({
      status: 'success',
      message: 'Product removed from wish lists successfully.',
    });
  }

  next(new AppError("You are not allowed to delete other's wish lists.", httpStatus.FORBIDDEN));
});
