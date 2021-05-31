import express from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import httpStatus from 'http-status';
import Fingerprint from 'express-fingerprint';
import Ddos from 'ddos';

import { responseObjectBuilder } from './utils/index.js';
import { ENV, serverConfig, dbConnection, logger } from './config/index.js';
import { userRouter, authRouter, docsRouter } from './routes/index.js';

class App {
  #app = null;

  #port = null;

  #server = null;

  #connection = null;

  #isSecureServer;

  userPath = '';

  authPath = '';

  docAPIPath = '';

  constructor(isSecureServer = false) {
    this.userAPIPath = '/api/users';
    this.authAPIPath = '/api/auths';
    this.docAPIPath = '/api-docs';
    this.#isSecureServer = isSecureServer;

    // config
    this.#app = express();

    this.#port = serverConfig.PORT;

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

    if (ENV === 'development') {
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
    //adding ddos defense
    const onDenial = function (req) {
      logger.warning('DDOS from ', req);
    };

    var ddos = new Ddos({
      burst:10,
      limit:15,
      whitelist:['10.0.0.101', 'localhost', '201.216.223.47'], onDenial
    });

    this.#app.use(ddos.express);

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
              param1: serverConfig.SERVER_FINGERKEY,
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
    try {
      if (this.#isSecureServer){
        const httpsServerOptions = {
          'key': fs.readFileSync(serverConfig.KEY_PEM),
          'cert': fs.readFileSync(serverConfig.CERT_PEM),
        }

        this.#server = https
                        .createServer(httpsServerOptions, this.#app)
                        .listen(this.#port, () => {
                          logger.info(`App is running at: ${serverConfig.URL}`);
                        });
      }else{
        this.#server = this.#app.listen(this.#port, () => {
          logger.info(`App is running at: ${serverConfig.URL}`);
        });
      }
    } catch (error) {
      logger.error(error);
      this.close();
    }
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
