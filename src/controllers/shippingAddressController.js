const httpStatus = require('http-status');

const ShippingAddress = require('../models/shippingAddressModel');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

exports.getAllShippingAddress = catchAsync(async (req, res, next) => {
  const shippingAddress = await ShippingAddress.find();

  res.status(httpStatus.OK).json({
    status: 'success',
    results: shippingAddress.length,
    data: {
      shippingAddress,
    },
  });
});

exports.getShippingAddress = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const shippingAddress = await ShippingAddress.findOne({ userId });

  if (!shippingAddress) return next(new AppError('There is no shipping address found.', httpStatus.NOT_FOUND));

  res.status(httpStatus.OK).json({
    status: 'success',
    data: {
      shippingAddress,
    },
  });
});

exports.createShippingAddress = catchAsync(async (req, res, next) => {
  const filteredData = pick(req.body, ShippingAddress.schema.requiredPaths());

  let userShippingAddress = await ShippingAddress.findOne({ userId: filteredData.userId });

  if (!userShippingAddress) {
    userShippingAddress = await ShippingAddress.create(filteredData);
  } else {
    const { shippingAddress: reqShippingAddress } = req.body;

    if (reqShippingAddress.defaultShippingAddress) {
      userShippingAddress.shippingAddress.forEach((address) => {
        address.defaultShippingAddress = false;
      });
    }

    userShippingAddress.shippingAddress.unshift(reqShippingAddress);

    await userShippingAddress.save();
  }

  res.status(httpStatus.CREATED).json({
    status: 'success',
    data: {
      shippingAddress: userShippingAddress,
    },
  });
});

exports.updateShippingAddress = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const userShippingAddress = await ShippingAddress.findOne({ userId });

  if (!userShippingAddress) return next(new AppError('There is no shipping address found.', httpStatus.NOT_FOUND));

  userShippingAddress.shippingAddress.forEach((address) => {
    if (`${address._id}` === req.body.id) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(req.body)) {
        address[key] = value;
      }
    }
  });

  await userShippingAddress.save();

  res.status(httpStatus.ACCEPTED).send({
    status: 'success',
    message: 'Shipping address updated successfully.',
  });
});

exports.deleteShippingAddress = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Find shippingAddress with userId
  let userShippingAddress = await ShippingAddress.findOne({ userId });

  //   1. If there is no userShippingAddress send him not found request.
  if (!userShippingAddress) return next(new AppError('There is no shipping address found.', httpStatus.NOT_FOUND));

  // Check the length of the userShippingAddress.
  //  1. Delete the specific productId from productIds

  const deletingAddressIndex = userShippingAddress.shippingAddress.findIndex(
    (address) => `${address._id}` === req.body.id
  );

  if (deletingAddressIndex === -1)
    return next(new AppError('Shipping address not found from the list.', httpStatus.BAD_REQUEST));

  userShippingAddress.shippingAddress.splice(deletingAddressIndex, 1);

  //  2. Check if the cart products length is >= 0 delete the entire cart or save the changes
  if (userShippingAddress.shippingAddress.length <= 0) {
    userShippingAddress = await ShippingAddress.findOneAndDelete({ userId });
  } else {
    await userShippingAddress.save();
  }

  //  3. Send response
  res.status(httpStatus.ACCEPTED).json({
    status: 'success',
    message: 'Shipping address removed successfully.',
  });
});
