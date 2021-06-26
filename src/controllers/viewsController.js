const catchAsync = require('../utils/catchAsync');

exports.getLogin = catchAsync((req, res, next) => {
  res.render('auth/login', { title: 'Login' });
});
