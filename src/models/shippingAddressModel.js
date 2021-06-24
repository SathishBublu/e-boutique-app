const mongoose = require('mongoose');

const toJSONPlugin = require('./plugins/toJSONPlugin');

const shippingAddressModelLayer = new mongoose.Schema({
  addressLineOne: {
    type: String,
    required: [true, 'Shipping Address should have a required address line.'],
    trim: true,
  },
  addressLineTwo: {
    type: String,
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
  defaultShippingAddress: {
    type: Boolean,
    default: false,
  },
});

shippingAddressModelLayer.plugin(toJSONPlugin);

const shippingAddressModel = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Shipping Address should belong to a user.'],
    trim: true,
  },
  shippingAddress: {
    type: [shippingAddressModelLayer],
    required: [true, 'User shipping address should not be empty.'],
  },
});

shippingAddressModel.plugin(toJSONPlugin);

shippingAddressModel.index({ userId: 1 });

const ShippingAddress = mongoose.model('ShippingAddress', shippingAddressModel);

module.exports = ShippingAddress;
