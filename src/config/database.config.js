/* eslint-disable security/detect-non-literal-fs-filename */
import mongoose from 'mongoose';
import fs from 'fs';

import { logger } from './logger.js';
import { mongooseConfig } from './app.config.js';

const dbConnection = async () => {
  try {
    const sslCA = mongooseConfig.is_tls === true ? [fs.readFileSync(mongooseConfig.CA_CERT, 'utf-8')] : '';
    const sslPass = mongooseConfig.is_tls === true ? mongooseConfig.CA_TOKEN : '';
    const sslKey = mongooseConfig.is_tls === true ? fs.readFileSync(mongooseConfig.KEY_CERT, 'utf-8') : '';
    const sslCert = mongooseConfig.is_tls === true ? fs.readFileSync(mongooseConfig.PEM_CERT, 'utf-8') : '';

    const options = {
      sslCA,
      sslPass,
      sslKey,
      sslCert,
      ssl: true,
    };

    await mongoose.connect(mongooseConfig.url, { ...options, ...mongooseConfig.options });

    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.info('Error on DB:');
    logger.error(error);
    throw new Error(`Error loading db, details:${error}`);
  }
};

// eslint-disable-next-line import/prefer-default-export
export { dbConnection };
