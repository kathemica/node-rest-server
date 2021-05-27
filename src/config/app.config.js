import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .default(process.env.NODE_ENV || 'development')
      .valid('production', 'development', 'test')
      .required(true),
    APP_PATH: Joi.string()
      .default(process.env.INIT_CWD || '')
      .description('Base app path'),
    SERVER_FINGERKEY: Joi.string().description('Server Random Key '),
    SERVER_URL: Joi.string().description('Base app path'),
    PORT: Joi.number().default(8080),
    MONGO_URL: Joi.string()
      .default(process.env.MONGO_URL || '')
      .description('Mongo DB url')
      .required(true),
    JWT_SECRET: Joi.string()
      .default(process.env.JWT_SECRET || '')
      .description('JWT secret key')
      .required(true),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.string().default('30m').description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.string().default('d').description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.string()
      .default('m')
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.string()
      .default('10m')
      .description('minutes after which verify email token expires'),
    MAIL_OWNER: Joi.string().description('owner for mail service'),
    MAIL_USERNAME: Joi.string().description('username for email server'),
    MAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    SENDGRID_API_KEY: Joi.string().default('').description('SENDGRID_API_KEY'),
    CA_CERT: Joi.string().default('').description('The path for CA Cert file'),
    KEY_CERT: Joi.string().default('').description('The path for Key Cert file'),
    PEM_CERT: Joi.string().default('').description('The path for PEM Cert file'),
    CA_TOKEN: Joi.string().default('').description('The key for open CA cert file'),
    IS_TLS: Joi.boolean().default(false).description('Should I Use TLS for mongo?'),
    GOOGLE_CLIENT_ID: Joi.string().description('Cliend ID for google Auth API '),
    GOOGLE_SECRET_ID: Joi.string().description('The key for access Google API Service'),
    npm_package_version: Joi.string().default('').description('Version from package.json'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const { APP_PATH } = envVars;
const VERSION = envVars.npm_package_version;
const env = envVars.NODE_ENV;
const { PORT } = envVars;
const { SERVER_FINGERKEY } = envVars;
const SERVER_URL = `${envVars.SERVER_URL}:${PORT}`;

const emailConfig = {
  owner: envVars.MAIL_OWNER,
  username: envVars.MAIL_USERNAME,
  from: envVars.MAIL_FROM,
  SENDGRID_API_KEY: envVars.SENDGRID_API_KEY,
};

const mongooseConfig = {
  url: envVars.MONGO_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
  is_tls: envVars.IS_TLS,
  CA_CERT: envVars.CA_CERT,
  CA_TOKEN: envVars.CA_TOKEN,
  KEY_CERT: envVars.KEY_CERT,
  PEM_CERT: envVars.PEM_CERT,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    sslValidate: false,
    tlsAllowInvalidHostnames: true,
  },
};

const jwtConfig = {
  secret: envVars.JWT_SECRET,
  accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
  refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
  verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
};

const googleConfig = {
  GOOGLE_CLIENT_ID: envVars.GOOGLE_CLIENT_ID,
  GOOGLE_SECRET_ID: envVars.GOOGLE_SECRET_ID,
};

// eslint-disable-next-line import/prefer-default-export
export { emailConfig, SERVER_FINGERKEY, APP_PATH, VERSION, env, PORT, SERVER_URL, mongooseConfig, jwtConfig, googleConfig };
