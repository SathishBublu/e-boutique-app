const mongoose = require('mongoose');
const chalk = require('chalk');
const logger = require('./logger');

const connectDB = async () => {
  const conn = await mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .catch((err) => {
      logger.error(chalk.red.bold("For some reasons we couldn't connect to the DB"), err);
    });

  logger.info(`MongoDB Connected: ${chalk.magentaBright(conn.connection.host)}`);
};

module.exports = connectDB;
