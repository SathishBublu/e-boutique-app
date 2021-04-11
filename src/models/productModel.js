const mongoose = require('mongoose');
const slugify = require('slugify');

const toJSONPlugin = require('./plugins/toJSONPlugin');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product must have a name.'],
      trim: true,
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Product must have a description.'],
      trim: true,
    },
    images: {
      type: [String],
    },
    category: {
      type: String,
      required: [true, 'Product must belong to a category.'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'A product must have a price.'],
    },
    sizes: {
      type: [String],
      required: [true, 'Product must have sizes of it.'],
    },
    stocks: {
      type: Number,
      required: [true, 'Product must have stocks'],
      default: 1,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

productSchema.plugin(toJSONPlugin);

// Virtual populate
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
