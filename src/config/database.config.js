import { logger } from './logger.js';
import { mongooseConfig } from './env.config.js';

const mongooseDbConnection = async (mongoose, fs) => {
  try {
    const sslCA = mongooseConfig.IS_TLS === true ? [fs.readFileSync(mongooseConfig.CA_CERT, 'utf-8')] : '';
    const sslPass = mongooseConfig.IS_TLS === true ? mongooseConfig.CA_TOKEN : '';
    const sslKey = mongooseConfig.IS_TLS === true ? fs.readFileSync(mongooseConfig.KEY_CERT, 'utf-8') : '';
    const sslCert = mongooseConfig.IS_TLS === true ? fs.readFileSync(mongooseConfig.PEM_CERT, 'utf-8') : '';

    const options = {
      sslCA,
      sslPass,
      sslKey,
      sslCert,
      ssl: true,
    };

    await mongoose.connect(mongooseConfig.URL, { ...options, ...mongooseConfig.options });

    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.info('Error on DB:');
    logger.error(error);
    throw new Error(`Error loading db, details:${error}`);
  }
};

// eslint-disable-next-line import/prefer-default-export
export { mongooseDbConnection as dbConnection};
