import mongoose from "mongoose";
import fs from "fs";
import _ from 'lodash';
import logger from '../config/logger.js';
import {mongoose_config} from "../config/config.app.js";

const dbConnection = async () => {
  try {
    const sslCA = (mongoose_config.is_tls === true)? [fs.readFileSync(mongoose_config.CA_CERT)] : "";
    const sslPass = (mongoose_config.is_tls === true) ? mongoose_config.CA_TOKEN : "";
    const sslKey = (mongoose_config.is_tls === true) ? fs.readFileSync(mongoose_config.KEY_CERT) : "";
    const sslCert = (mongoose_config.is_tls === true) ? fs.readFileSync(mongoose_config.PEM_CERT) : "";    

    const options = {
      sslCA,
      sslPass,
      sslKey,
      sslCert,
      ssl: true
    };

    await mongoose.connect(mongoose_config.url, {...options, ...mongoose_config.options});
    
    logger.info('Connected to MongoDB');    
  } catch (error) {
    logger.info('Error on DB:'); 
    logger.error(error);
    throw new Error(`Error loading db, details:${error}`);
  }
};

export { dbConnection };
