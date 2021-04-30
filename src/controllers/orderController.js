const httpStatus = require('http-status');

const Order = require('../models/orderModel');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const helpers = require('../utils/helpers');
const pick = require('../utils/pick');

// Create Order
exports.createOrder = catchAsync(async (req, res, next) => {
  const isOwner = helpers.checkOwnerShip(req.body.userId, req.user);

  if (isOwner) {
    const filteredData = pick(req.body, Order.schema.requiredPaths());
    const order = await Order.create(filteredData);

    return res.status(httpStatus.CREATED).json({
      status: 'success',
      message: 'Order placed successfully.',
      data: { order },
    });
  }

  next(new AppError('You are not allowed to place order from another id', httpStatus.FORBIDDEN));
});

// Get All Order
exports.getAllUserOrder = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const isOwner = helpers.checkOwnerShip(userId, req.user);

  if (isOwner) {
    const orders = await Order.find({ userId });

    return res.status(httpStatus.OK).json({
      status: 'success',
      results: orders.length,
      data: { orders },
    });
  }

  next(new AppError('You are not allowed to access others orders.', httpStatus.FORBIDDEN));
});

// Get Order
exports.getOrder = catchAsync(async (req, res, next) => {
  const { userId, orderId } = req.params;

  const isOwner = helpers.checkOwnerShip(userId, req.user);

  if (isOwner) {
    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) return next(new AppError('No order found', httpStatus.NOT_FOUND));

    return res.status(httpStatus.OK).json({ status: 'success', data: { order } });
  }

  next(new AppError('You are not allowed to access other orders', httpStatus.FORBIDDEN));
});

// Delete Order
exports.deleteOrder = catchAsync(async (req, res, next) => {
  const { userId, orderId } = req.params;

  const isOwner = helpers.checkOwnerShip(userId, req.user);
  if (isOwner) {
    const deletedOrder = await Order.findOneAndDelete({ _id: orderId, userId });

    if (!deletedOrder) return next(new AppError('There is no order found.', httpStatus.BAD_REQUEST));

    return res.status(httpStatus.ACCEPTED).json({ status: 'success', message: 'Order deleted successfully.' });
  }

  next(new AppError('You are not allowed to delete other orders', httpStatus.FORBIDDEN));
});

// Update Order
// Only for the admin
// TODO: Need to be implement when the admin views works done.
exports.updateOrder = catchAsync(async (req, res, next) => {
  res.status(httpStatus.ACCEPTED).json({ status: 'success', message: 'Order Updated' });
});

// Get All Order
// Only for the admin
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find();

  res.status(httpStatus.OK).json({
    status: 'success',
    results: orders.length,
    data: { orders },
  });
});
