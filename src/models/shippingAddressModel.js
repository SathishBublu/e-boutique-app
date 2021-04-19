const mongoose = require('mongoose');

const toJSONPlugin = require('./plugins/toJSONPlugin');

const shippingAddressModel = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Shipping Address should belong to a user.'],
    trim: true,
  },
  district: {
    type: String,
    required: [true, 'Shipping Address should have a district.'],
    trim: true,
  },
  town: {
    type: String,
    required: [true, 'Shipping Address should have your home town.'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'Shipping Address should have a city.'],
    trim: true,
  },
  pincode: {
    type: Number,
    required: [true, 'Shipping Address should have a pincode.'],
  },
});

shippingAddressModel.plugin(toJSONPlugin);

shippingAddressModel.index({ userId: 1 });

const ShippingAddress = mongoose.model('ShippingAddress', shippingAddressModel);

module.exports = ShippingAddress;
