/**
 * Check ownership before proceed to next action.
 * @param {string} requestedUserId - Requested user id
 * @param {object} loggedUser - Logged in User details
 * @returns {boolean}
 */
exports.checkOwnerShip = (requestedUserId, loggedUser) => {
  if (requestedUserId !== loggedUser.id && loggedUser.role !== 'admin') return false;
  return true;
};
