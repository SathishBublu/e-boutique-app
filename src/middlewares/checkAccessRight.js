const httpStatus = require('http-status');

const AppError = require('../utils/AppError');
const helpers = require('../utils/helpers');

module.exports = (req, res, next) => {
  console.log('Entering AccessRights middleware'); // TODO: Need to be removed before app goes to production
  // Set initially access rights as true
  let hasAccessRights = true;

  // 1. If there is no userId on body and params let the user know fields are missing
  if (!req.params.userId && !req.body.userId)
    return next(new AppError('User ID is missing.', httpStatus.EXPECTATION_FAILED));

  // 2. Check if there is userId from request params
  // 3. Check if the userId in the params match the logged in user id
  if (req.params.userId) hasAccessRights = helpers.checkOwnerShip(req.params.userId, req.user);

  // 4. Check if there is userId from the request body
  // 5. Check if the userId in the body match the logged in user id
  if (req.body.userId) hasAccessRights = helpers.checkOwnerShip(req.body.userId, req.user);

  if (!hasAccessRights) return next(new AppError("Access to other's details are denied.", httpStatus.FORBIDDEN));

  console.log('Access Rights confirmed.'); // TODO: Need to be removed before app goes to production
  next();
};
