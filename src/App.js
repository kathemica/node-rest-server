// Dependency Injections pattern
class App {
  #app = null;

  #port = null;

  #server = null;

  #connection = null;

  #environment = {};

  userAPIPath = '';

  authAPIPath = '';

  docAPIPath = '';

  constructor (classArgs, cors) {
    this.userAPIPath = '/api/users';
    this.authAPIPath = '/api/auths';
    this.docAPIPath = '/api-docs';
    this.#environment = classArgs;

    // config
    this.#app = this.#environment['express']();

    this.#port = this.#environment['env'].serverConfig.PORT;

    this.#connectDB();

    this.#middlewares(cors);

    this.#routes();
  }

  async #connectDB() {
    try {
      this.#connection =  await this.#environment['dbConnection'](this.#environment['middlewares']['database'], this.#environment['middlewares']['files']);
      this.#environment['utils']['logs'].info('Connected to databse')
    } catch (error) {
      this.#environment['utils']['logs'].error(`Error loading db, details:${error}`);
    }
  }

  #routes() {
    // adding routes to App
    this.#app.use(this.authAPIPath, this.#environment['routes']['auth']);
    this.#app.use(this.userAPIPath, this.#environment['routes']['user']);

    if (this.#environment['env'].ENV === 'development') {
      this.#app.use(this.docAPIPath, this.#environment['routes']['swagger']);
    }

    this.#app.use((req, res, next) => {
      next(
        this.#environment['utils']['ROB'](
          res,
          this.#environment['imports']['status'].NOT_IMPLEMENTED,
          'Fail',
          'Not enabled',
          'Resource you require is not implemented.'
        )
      );
    });
  }

  #middlewares(cors) {
    // middlewares
    //adding ddos defense
    const onDenial = function (req) {
      this.#environment['utils']['logs'].warning('DDOS from ', req);
    };

    var ddos = new this.#environment['middlewares']['antiDDos']({
      burst:10,
      limit:15,
      whitelist:['10.0.0.101', 'localhost', '201.216.223.47'], onDenial
    });

    this.#app.use(ddos.express);

    // CORS: enable petition when using several services at same App
    this.#app.use(cors());

    // set security HTTP headers with helmet
    this.#app.use(this.#environment['middlewares']['protect']());
    // remembering browser
    const fingerPrints= this.#environment['env'].serverConfig.SERVER_FINGERKEY;

    this.#app.use(
      this.#environment['middlewares']['finger_Print']({
        parameters: [
          // Defaults
          this.#environment['middlewares']['finger_Print'].useragent,
          this.#environment['middlewares']['finger_Print'].acceptHeaders,
          // Fingerprint.geoip,

          // personalized params
          (next) => {
            next(null, {
              fingerprint: fingerPrints,
            });
          },
        ],
      })
    );

    // parsing body
    this.#app.use(this.#environment['express'].json());
    this.#app.use(
      this.#environment['express'].urlencoded({
        extended: true,
      })
    );

    // adding public folder
    this.#app.use(
      this.#environment['express'].static('public', {
        extensions: ['html'],
      })
    );
  }

  start() {
    try {
      if (this.#environment['env'].serverConfig.isHTTPS){
        const httpsServerOptions = {
          'key': this.#environment['middlewares']['files'].readFileSync(this.#environment['env'].serverConfig.KEY_PEM),
          'cert': this.#environment['middlewares']['files'].readFileSync(this.#environment['env'].serverConfig.CERT_PEM),
        }

        this.#server = this.#environment['middlewares']['tls']
                        .createServer(httpsServerOptions, this.#app)
                        .listen(this.#port, () => {
                          this.#environment['utils']['logs'].info(`App is running at: ${this.#environment['env'].serverConfig.URL}`);
                        });
      }else{
        this.#server = this.#app.listen(this.#port, () => {
          this.#environment['utils']['logs'].info(`App is running at: ${this.#environment['env'].serverConfig.URL}`);
        });
      }
    } catch (error) {
      this.#environment['utils']['logs'].error('error', error);
      this.close();
    }
  }

  close() {
    if (this.#server) {
      this.#server.close(() => {
        this.#environment['utils']['logs'].info('Server closed');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }
}

export default App;
