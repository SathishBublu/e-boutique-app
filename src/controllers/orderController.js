const httpStatus = require('http-status');

const Order = require('../models/orderModel');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

// Create Order
exports.createOrder = catchAsync(async (req, res, next) => {
  const filteredData = pick(req.body, Order.schema.requiredPaths());
  const order = await Order.create(filteredData);

  res.status(httpStatus.CREATED).json({
    status: 'success',
    message: 'Order placed successfully.',
    data: { order },
  });
});

// Get All Order
exports.getAllUserOrder = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const orders = await Order.find({ userId });

  res.status(httpStatus.OK).json({
    status: 'success',
    results: orders.length,
    data: { orders },
  });
});

// Get Order
exports.getOrder = catchAsync(async (req, res, next) => {
  const { userId, orderId } = req.params;

  const order = await Order.findOne({ _id: orderId, userId });

  if (!order) return next(new AppError('No order found', httpStatus.NOT_FOUND));

  res.status(httpStatus.OK).json({ status: 'success', data: { order } });
});

// Delete Order
exports.deleteOrder = catchAsync(async (req, res, next) => {
  const { userId, orderId } = req.params;

  const deletedOrder = await Order.findOneAndDelete({ _id: orderId, userId });

  if (!deletedOrder) return next(new AppError('There is no order found.', httpStatus.BAD_REQUEST));

  res.status(httpStatus.ACCEPTED).json({ status: 'success', message: 'Order deleted successfully.' });
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
