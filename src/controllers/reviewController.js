const httpStatus = require('http-status');

const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const AppError = require('../utils/AppError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.productId) filter = { product: req.params.productId };

  const productPopulateConfig = {
    path: 'product',
    select: 'name slug category images',
  };

  const reviews = await Review.find(filter).populate(productPopulateConfig);

  res.status(httpStatus.OK).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;

  const user = await Review.findOne({ user: req.user.id });

  if (user) return next(new AppError('Users are allowed only once for a review of a product!', httpStatus.BAD_REQUEST));

  const newReview = await Review.create(req.body);

  res.status(httpStatus.CREATED).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOne({ _id: req.params.reviewId });

  if (!review)
    return next(new AppError(`There is no review found with this id : ${req.params.id}`, httpStatus.NOT_FOUND));

  if (review.user.id !== req.user.id && req.user.role !== 'admin')
    return next(new AppError("You are not allowed not allowed to delete another's review!", httpStatus.FORBIDDEN));

  await Review.deleteOne({ _id: review.id });

  res.status(httpStatus.ACCEPTED).json({
    status: 'success',
    message: 'Review deleted successfully',
  });
});
