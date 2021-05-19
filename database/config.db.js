import mongoose from "mongoose";
import colors from "colors";
import fs from "fs";
import {
  CA_TOKEN,
  CA_CERT,
  KEY_CERT,
  PEM_CERT,
  ATLAS_MONGO_URL,
  IS_TLS,
} from "../config/config.js";

const dbConnection = async () => {
  try {
    const sslCA = IS_TLS ? [fs.readFileSync(CA_CERT)] : "";
    const sslPass = IS_TLS ? CA_TOKEN : "";
    const sslKey = IS_TLS ? fs.readFileSync(KEY_CERT) : "";
    const sslCert = IS_TLS ? fs.readFileSync(PEM_CERT) : "";

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
      sslValidate: false,
      tlsAllowInvalidHostnames: true,
      ssl: true,
      sslCA,
      sslPass,
      sslKey,
      sslCert,
    };

    await mongoose.connect(ATLAS_MONGO_URL, options);

    console.log(`Connected to db`.blue);
  } catch (error) {
    throw new Error(`Error loading db, details:${error}`);
  }
};

export { dbConnection };
