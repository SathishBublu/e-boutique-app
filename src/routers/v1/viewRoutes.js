const express = require('express');

const router = express.Router();

const viewsController = require('../../controllers/viewsController');

router.get('/login', viewsController.getLogin);

module.exports = router;
