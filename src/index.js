import express from 'express';
import https from 'https';
import mongoose from 'mongoose';
import Fingerprint from 'express-fingerprint';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import Ddos from 'ddos';
import httpStatus from 'http-status';

import App from './App.js';
import { logger, environment, dbConnection } from './config/index.js';
import { responseObjectBuilder } from './utils/index.js';
import { userRouter, authRouter, docsRouter } from './routes/index.js';

const app = new App({
    env: environment(),
    dbConnection,
    express: express,
    middlewares:{
      database: mongoose,
      files: fs,
      protect: helmet,
      tls: https,
      antiDDos: Ddos,
      finger_Print: Fingerprint
    },
    utils:{
      logs : logger,
      ROB : responseObjectBuilder
    },
    routes: {
      user : userRouter,
      auth : authRouter,
      swagger : docsRouter
    },
    imports:{
      status: httpStatus,
    }
  },
  cors);

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
