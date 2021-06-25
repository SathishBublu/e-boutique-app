/**
 * Checks ownership before proceed to next action.
 * @param {string} requestedUserId - Requested user id
 * @param {object} loggedUser - Logged in User details
 * @returns boolean
 */
exports.checkOwnerShip = (requestedUserId, loggedUser) => {
  if (requestedUserId !== loggedUser.id && loggedUser.role !== 'admin') return false;
  return true;
};

/**
 * Checks the input is a number or a string.
 * @param {string} value - Either a string nor a number
 * @returns boolean
 */
exports.isNumeric = (value) => !Number.isNaN(value) && !Number.isNaN(parseFloat(value));
