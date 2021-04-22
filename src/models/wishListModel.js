const mongoose = require('mongoose');

const toJSONPlugin = require('./plugins/toJSONPlugin');

const wishListModel = new mongoose.Schema(
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

wishListModel.plugin(toJSONPlugin);

const WishList = mongoose.model('WishList', wishListModel);

module.exports = WishList;
