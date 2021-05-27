import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import httpStatus from 'http-status';
import Fingerprint from 'express-fingerprint';

import { responseObjectBuilder } from './utils/index.js';
import { PORT, env, dbConnection, logger, SERVER_URL, SERVER_FINGERKEY } from './config/index.js';
import { userRouter, authRouter, docsRouter } from './routes/index.js';

class App {
  #app = null;

  #port = null;

  #server = null;

  #connection = null;

  userPath = '';

  authPath = '';

  docAPIPath = '';

  constructor() {
    this.userAPIPath = '/api/users';
    this.authAPIPath = '/api/auths';
    this.docAPIPath = '/api-docs';

    // config
    this.#app = express();

    this.#port = PORT;

    this.#connectDB();

    this.#middlewares();

    this.#routes();
  }

  #connectDB() {
    try {
      this.#connection = dbConnection();
    } catch (error) {
      logger.error(`Error loading db, details:${error}`);
    }
  }

  #routes() {
    // adding routes to App
    this.#app.use(this.authAPIPath, authRouter);
    this.#app.use(this.userAPIPath, userRouter);

    if (env === 'development') {
      this.#app.use(this.docAPIPath, docsRouter);
    }

    this.#app.use((req, res, next) => {
      next(
        responseObjectBuilder(
          res,
          httpStatus.NOT_IMPLEMENTED,
          'Fail',
          'Not enabled',
          'Resource you require is not implemented.'
        )
      );
    });
  }

  #middlewares() {
    // middlewares
    // CORS: enable petition when using several services at same App
    this.#app.use(cors());

    // set security HTTP headers
    this.#app.use(helmet());

    // remembering browser
    this.#app.use(
      Fingerprint({
        parameters: [
          // Defaults
          Fingerprint.useragent,
          Fingerprint.acceptHeaders,
          // Fingerprint.geoip,

          // Additional parameters
          function (next) {
            next(null, {
              param1: SERVER_FINGERKEY,
            });
          },
          // function (next) {
          //   next(null, {
          //     param2: 'value2',
          //   });
          // },
        ],
      })
    );

    // parsing body
    this.#app.use(express.json());
    this.#app.use(
      express.urlencoded({
        extended: true,
      })
    );

    // adding public folder
    this.#app.use(
      express.static('public', {
        extensions: ['html'],
      })
    );
  }

  start() {
    this.#server = this.#app.listen(this.#port, () => {
      logger.info(`App is running at: ${SERVER_URL}`);
    });
  }

  close() {
    if (this.#server) {
      this.#server.close(() => {
        logger.info('Server closed');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }
}

export default App;
