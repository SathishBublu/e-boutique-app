const express = require('express');

const router = express.Router();
const userController = require('../../controllers/userController');
const authController = require('../../controllers/authController');

router.use(authController.protect);

router.patch('/update-my-Password', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/update-me', userController.updateMe);
router.delete('/delete-me', userController.deleteMe);

// Protected route : access only for admin
// make sure have to do admin auth controller

router.use(authController.restrictTo('admin'));

router.route('/:id').get(userController.getUser);

router.route('/').get(userController.getAllUsers).post(userController.createUser);

router.route('/:id').patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
