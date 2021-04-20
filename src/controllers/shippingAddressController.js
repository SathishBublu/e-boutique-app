const httpStatus = require('http-status');

const ShippingAddress = require('../models/shippingAddressModel');
const User = require('../models/userModel');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const helpers = require('../utils/helpers');

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

  const isOwner = helpers.checkOwnerShip(userId, req.user);

  if (isOwner) {
    const shippingAddress = await ShippingAddress.findOne({ userId });

    if (!shippingAddress) return next(new AppError('There is no shipping address found.', httpStatus.NOT_FOUND));

    return res.status(httpStatus.OK).json({
      status: 'success',
      data: {
        shippingAddress,
      },
    });
  }
  next(new AppError('You are not allowed to see other shipping address.', httpStatus.FORBIDDEN));
});

exports.createShippingAddress = catchAsync(async (req, res, next) => {
  const filteredData = pick(req.body, ShippingAddress.schema.requiredPaths());

  let isOwner;
  if (filteredData.userId) isOwner = helpers.checkOwnerShip(filteredData.userId, req.user, next);

  if (isOwner) {
    if (!filteredData.userId) filteredData.userId = req.user.id;

    const shippingAddressExists = await ShippingAddress.findOne({ userId: filteredData.userId });

    if (shippingAddressExists) return next(new AppError('Shipping Address already Exists', httpStatus.BAD_REQUEST));

    const newShippingAddress = await ShippingAddress.create(filteredData);
    await User.findByIdAndUpdate(filteredData.userId, { address: newShippingAddress.id });

    return res.status(httpStatus.CREATED).json({
      status: 'success',
      data: {
        shippingAddress: newShippingAddress,
      },
    });
  }

  next(new AppError('You are not allowed to create shipping address with other ID.'), httpStatus.FORBIDDEN);
});

exports.updateShippingAddress = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const isOwner = helpers.checkOwnerShip(userId, req.user);

  if (isOwner) {
    const shippingAddressExists = await ShippingAddress.findOne({ userId });

    if (!shippingAddressExists) return next(new AppError('There is no shipping address found.', httpStatus.NOT_FOUND));

    const filteredData = pick(req.body, ShippingAddress.schema.requiredPaths());

    const updatedShippingAddress = await ShippingAddress.findOneAndUpdate({ userId }, filteredData, {
      new: true,
      runValidators: true,
    });

    return res.status(httpStatus.ACCEPTED).send({
      status: 'success',
      data: {
        shippingAddress: updatedShippingAddress,
      },
    });
  }
  next(new AppError("You are not allowed to update other's shipping address.", httpStatus.FORBIDDEN));
});

exports.deleteShippingAddress = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const isOwner = helpers.checkOwnerShip(userId, req.user);

  if (isOwner) {
    const deletedShippingAddress = await ShippingAddress.findOneAndDelete({ userId });

    if (!deletedShippingAddress) return next(new AppError('There is no shipping Address found', httpStatus.NOT_FOUND));

    return res.status(httpStatus.ACCEPTED).json({
      status: 'success',
      message: 'Shipping address deleted successfully',
    });
  }

  next(new AppError("You are not allowed to delete other's shipping address", httpStatus.FORBIDDEN));
});
