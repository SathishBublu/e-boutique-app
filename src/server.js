const chalk = require('chalk');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const app = require('./app');
const connectDB = require('./config/connectDB');
const logger = require('./config/logger');

connectDB();

const PORT = process.env.PORT || 3000;
const HOST = process.env.APP_HOST || '';

const server = app.listen(PORT, () => {
  logger.info(chalk.bgYellowBright.black(`App running on ${HOST}:${PORT}...`));
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
