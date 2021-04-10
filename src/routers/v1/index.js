const express = require('express');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');

const router = express.Router();

const defaultRoutes = [
  { path: '/auth', route: authRoutes },
  { path: '/users', route: userRoutes },
  { path: '/products', route: productRoutes },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
