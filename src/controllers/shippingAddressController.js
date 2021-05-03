const httpStatus = require('http-status');

const ShippingAddress = require('../models/shippingAddressModel');
const User = require('../models/userModel');

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

  const shippingAddressExists = await ShippingAddress.findOne({ userId: filteredData.userId });

  if (shippingAddressExists) return next(new AppError('Shipping Address already Exists', httpStatus.BAD_REQUEST));

  const newShippingAddress = await ShippingAddress.create(filteredData);
  await User.findByIdAndUpdate(filteredData.userId, { address: newShippingAddress.id });

  res.status(httpStatus.CREATED).json({
    status: 'success',
    data: {
      shippingAddress: newShippingAddress,
    },
  });
});

exports.updateShippingAddress = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const shippingAddressExists = await ShippingAddress.findOne({ userId });

  if (!shippingAddressExists) return next(new AppError('There is no shipping address found.', httpStatus.NOT_FOUND));

  const filteredData = pick(req.body, ShippingAddress.schema.requiredPaths());

  const updatedShippingAddress = await ShippingAddress.findOneAndUpdate({ userId }, filteredData, {
    new: true,
    runValidators: true,
  });

  res.status(httpStatus.ACCEPTED).send({
    status: 'success',
    data: {
      shippingAddress: updatedShippingAddress,
    },
  });
});

exports.deleteShippingAddress = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const deletedShippingAddress = await ShippingAddress.findOneAndDelete({ userId });

  if (!deletedShippingAddress) return next(new AppError('There is no shipping Address found', httpStatus.NOT_FOUND));

  res.status(httpStatus.ACCEPTED).json({
    status: 'success',
    message: 'Shipping address deleted successfully',
  });
});
