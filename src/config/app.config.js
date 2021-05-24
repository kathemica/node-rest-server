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
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
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

const emailConfig = {
  smtp: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    auth: {
      user: envVars.SMTP_USERNAME,
      pass: envVars.SMTP_PASSWORD,
    },
  },
  from: envVars.EMAIL_FROM,
};

export default emailConfig;
export { APP_PATH, VERSION, env, PORT, mongooseConfig, jwtConfig, googleConfig };
