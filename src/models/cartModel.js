const mongoose = require('mongoose');

const toJSONPlugin = require('./plugins/toJSONPlugin');

const cartModel = new mongoose.Schema(
  {
    productIds: {
      type: [mongoose.Schema.ObjectId],
      ref: 'Product',
      required: [true, 'Wish list should have a product ID.'],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Wish list must belong to a user.'],
      trim: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

cartModel.plugin(toJSONPlugin);

const Cart = mongoose.model('Cart', cartModel);

module.exports = Cart;
