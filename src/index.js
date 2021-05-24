import App from './app.js';
import { logger } from './config/index.js';

const app = new App();

app.start();

const exitHandler = () => {
  if (app) {
    app.stop();
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
  exitHandler();
});
