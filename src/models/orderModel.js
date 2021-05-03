const mongoose = require('mongoose');

const toJSONPlugin = require('./plugins/toJSONPlugin');

const shippingMethodSchema = new mongoose.Schema({
  method: {
    type: String,
    required: [true, 'Order must have a shipping method.'],
    default: 'standard',
    enum: ['standard', 'express', 'freeShipping'],
  },
  cost: {
    type: Number,
    required: [true, 'Shipping should have a cost.'],
  },
});

shippingMethodSchema.plugin(toJSONPlugin);

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a user.'],
    trim: true,
  },
  shippingAddress: {
    type: mongoose.Schema.ObjectId,
    ref: 'ShippingAddress',
    required: [true, 'Order must have a shipping address.'],
    trim: true,
  },
  status: {
    type: String,
    required: [true, 'Order must have a status.'],
    default: 'orderPlaced',
    enum: ['orderPlaced', 'shipping', 'outForDelivery', 'delivered'],
  },
  shippingDate: {
    type: Date,
    required: [true, 'Order must have a date for a expected delivery.'],
    default: new Date().setTime(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Automatic default date for next 7 days
  },
  orderedItems: {
    type: [Object],
    required: [true, 'Order should have ordered items.'],
    validate: {
      validator: function (val) {
        if (val.length === 0) return false;
        return true;
      },
      message: 'Order should have ordered items.',
    },
  },
  orderTax: {
    type: Number,
    default: 0,
  },
  orderSubTotal: {
    type: Number,
    required: [true, 'Order must have a sub total.'],
    validate: {
      validator: function (val) {
        if (val <= 0) return false;
        return true;
      },
      message: 'Sub total must not to be below than 0 currency.',
    },
  },
  paymentMethod: {
    type: String,
    required: [true, 'Order must have a payment method.'],
    enum: ['cod', 'gpay'], // cod => Cash On Delivery, gpay => Google Pay
  },
  paymentStatus: {
    type: String,
    required: [true, 'Order must have a payment status.'],
    enum: ['paid', 'unpaid'],
  },
  shippingMethod: {
    type: shippingMethodSchema,
    required: [true, 'Order must have a shipping method.'],
  },
});

orderSchema.plugin(toJSONPlugin);

orderSchema.virtual('orderTotal').get(function () {
  return this.orderSubTotal + this.orderTax;
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
