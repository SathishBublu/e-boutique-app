const httpStatus = require('http-status');
// const multer = require('multer');

const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const Email = require('../services/emailService');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(httpStatus.OK).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new AppError('User not found with this ID.', httpStatus.NOT_FOUND));

  res.status(httpStatus.OK).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendWelcome();

  res.status(httpStatus.CREATED).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('User not found by the ID', httpStatus.NOT_FOUND));
  }

  res.status(httpStatus.OK).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('User not found by the ID', httpStatus.NOT_FOUND));
  }

  res.status(httpStatus.ACCEPTED).json({
    status: 'success',
    message: 'User deleted successfully!',
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);

  // 1. check if the user POST's a password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not to update the password. Please use /updateMyPassword', 400));
  }

  // 2. Filter the unwanted data from the req.body
  const filteredBody = pick(req.body, ['name', 'email']);
  if (req.file) filteredBody.photo = req.file.filename;

  // 3. Find the user and update details with the filtered data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  // 4. Send response
  res.status(httpStatus.OK).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // 3. Find the user and set inactive
  const deletedUser = await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  if (!deletedUser) {
    return next(new AppError(`No user found with ID : ${req.user.id}`, httpStatus.NOT_FOUND));
  }

  const url = `${req.protocol}://${req.get('host')}/feedback`;
  await new Email(deletedUser, url).sendFarewell();

  // 4. Send response
  res.status(httpStatus.ACCEPTED).json({
    status: 'success',
    message: 'User deleted successfully!',
  });
});
