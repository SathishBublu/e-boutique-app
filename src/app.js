const path = require('path');
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cors = require('cors');

const csp = require('./middlewares/csp');
// const pug = require('pug');

const requestLogger = require('./middlewares/requestLogger');
const apiLimiter = require('./middlewares/rateLimiter');
const AppError = require('./utils/AppError');

// controllers
const globalErrorController = require('./controllers/errorController');

// router
const apiRouter = require('./routers/v1');
const viewRouter = require('./routers/v1/viewRoutes');

// Start express app
const app = express();

app.enable('trust proxy');

// Set security HTTP headers
app.use(helmet());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// app.use(cors({
//   origin: ''
// }))

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

app.use(csp);

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Limit requests from same API
app.use('/api', apiLimiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [], // TODO: Fix hpp before deploy
  })
);

app.use(compression());

// app.get('/', (req, res, next) => {
//   res.send('Hello World!!!');
// });

// 2) Routes
app.use('/', viewRouter);
app.use(`/api/${process.env.API_VERSION}`, apiRouter);

// 3) Redirect : NOT FOUND
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4) Global Error handler
// Global error controller => ( will control errors coming from all of the files. )
app.use(globalErrorController);

module.exports = app;
