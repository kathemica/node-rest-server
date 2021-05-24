import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import httpStatus from 'http-status';

import { responseObjectBuilder } from './utils/index.js';
import { PORT, env, dbConnection, logger } from './config/index.js';
import { userRouter , authRouter, docsRouter } from './routes/index.js';

class App {
  #app = null;

  #port = null;

  #server = null;

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

  // eslint-disable-next-line class-methods-use-this
  #connectDB() {
    try {
      dbConnection();
    } catch (error) {
      logger.error(`Error loading db, details:${error}`);
    }
  }

  start() {
    this.#server = this.#app.listen(this.#port, () => {
      logger.info(`App is running at port: ${this.#port}`);
    });
  }

  close(){
    if (this.#server){
        this.#server.close(() => {
          logger.info('Server closed');
          process.exit(1);
        }
      )
    }else {
        process.exit(1);
    }
  }
}

export default App;
