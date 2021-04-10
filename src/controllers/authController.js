const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');

const User = require('../models/userModel');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

const Email = require('../services/emailService');
const { sendCreatedToken } = require('../services/tokenService');

exports.register = catchAsync(async (req, res, next) => {
  if (await User.isEmailTaken(req.body.email)) {
    return next(new AppError('Email already taken', httpStatus.BAD_REQUEST));
  }

  const filteredBody = pick(req.body, User.schema.requiredPaths());

  const newUser = await User.create(filteredBody);

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  sendCreatedToken(newUser, httpStatus.CREATED, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if username or email and password exits
  if (!email || !password) {
    return next(new AppError('Please provide email and password', httpStatus.BAD_REQUEST));
  }

  // 2. If no user found give error
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isPasswordMatch(password, user.password))) {
    return next(new AppError('Incorrect email or password', httpStatus.UNAUTHORIZED));
  }

  // 3. If user exits give a token
  sendCreatedToken(user, httpStatus.OK, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  req.user = null;
  res.status(httpStatus.OK).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Check if user have token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // else if (req.cookie.jwt) {
  //   token = req.cookie.jwt;
  // }

  // 2. If there is no token send error
  if (!token) {
    return next(new AppError('Please Login to get access.', httpStatus.UNAUTHORIZED));
  }

  // 3. verify token with jwt
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 4. Check if user is still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', httpStatus.UNAUTHORIZED));
  }

  // 5. Check if the user changed password after token as issued.
  if (currentUser.changedPasswordAfterToken(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', httpStatus.UNAUTHORIZED));
  }

  // 6. If all true allow access
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
  // Check if the user has its role to perform task && if not send error
  if (!roles.includes(req.user.role)) {
    return next(new AppError("You don't have permission to perform this action", httpStatus.FORBIDDEN));
  }

  // If he has the correct role give permission
  next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the email. Try again later!'), 500);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get token and hash it
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', httpStatus.BAD_REQUEST));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 5. Create token and get sign in
  sendCreatedToken(user, httpStatus.OK, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get user by the id
  const user = await User.findById(req.user.id).select('+password');

  // 2. Check if current POSTed password is correct
  if (!(await user.isPasswordMatch(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your password is wrong!.', httpStatus.UNAUTHORIZED));
  }

  // 3. If so, update the user password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4. Get login again
  sendCreatedToken(user, httpStatus.OK, res);
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // 1. Check if user have token
  if (req.cookies.jwt) {
    try {
      // 1. Verify token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      // 2. Check if has current user
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3. Check if user was changed password recently
      if (currentUser.changedPasswordAfterToken(decoded.iat)) {
        return next();
      }

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
});
