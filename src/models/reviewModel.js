const mongoose = require('mongoose');
const Product = require('./productModel');

const toJSONPlugin = require('./plugins/toJSONPlugin');

const reviewSchema = new mongoose.Schema(
  {
    reviewTitle: {
      type: String,
      required: [true, 'Please provide a title for your review.'],
      trim: true,
    },
    review: {
      type: String,
      required: [true, 'Please provide some review.'],
      max: [500, 'Review should be below 500 character.'],
      trim: true,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be atleast 1'],
      max: [5, 'Rating must not to be more than 5'],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product!.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user!.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

reviewSchema.plugin(toJSONPlugin);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.virtual('postedOn').get(function () {
  return this.createdAt;
});

reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.product);
});

// reviewSchema.pre('remove', function (next) {
//   this.constructor.calcAverageRating(this.product);
//   next();
// });

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.review.constructor.calcAverageRating(this.review.product);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
