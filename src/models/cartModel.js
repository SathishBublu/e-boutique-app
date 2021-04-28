const mongoose = require('mongoose');

const toJSONPlugin = require('./plugins/toJSONPlugin');

function formatMsg(props) {
  const { productId, placedItems, size } = props.value[0];

  if (!productId && !size) return 'product id & size fields are missing.';
  if (!productId) return 'product id is missing.';
  if (!size) return 'product size is missing.';
  if (placedItems < 1) return 'Product item should have minimum of 1 item to save in cart.';

  return 'Product fields are missing.';
}

const PRODUCT_REQUIRED_SIZES = ['XXL', 'XL', 'L', 'M', 'S'];

// cart => products : sub document model
const cartProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Cart must have a product to store.'],
    trim: true,
  },
  placedItems: {
    type: Number,
    default: 1,
  },
  size: {
    type: String,
    required: [true, 'Product must have a size to add to cart.'],
    validate: {
      validator: function (val) {
        return PRODUCT_REQUIRED_SIZES.includes(val);
      },
      message: (props) => {
        const { path, value } = props;
        return `${
          path.charAt(0).toUpperCase() + path.slice(1)
        } : ${value} is not acceptable, The acceptable sizes are ${PRODUCT_REQUIRED_SIZES.join(',')}.`;
      },
    },
  },
});

cartProductSchema.plugin(toJSONPlugin);

const cartSchema = new mongoose.Schema(
  {
    products: {
      type: [cartProductSchema],
      required: [true, 'Cart should have a product.'],
      validate: {
        validator: function (val) {
          const { productId, size, placedItems } = val[0];
          if (!productId || !size || placedItems < 1) return false;
          return true;
        },
        message: (props) => `${formatMsg(props)}`,
      },
      default: () => ({}),
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Cart must belong to a user.'],
      trim: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

cartSchema.plugin(toJSONPlugin);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
