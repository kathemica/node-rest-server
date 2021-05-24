import App from './App.js';
import { logger } from './config/index.js';

const app = new App();

app.start();

const exitHandler = () => {
  if (app) {
    app.close();
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
  if (app) {
    app.close();
  }
});
