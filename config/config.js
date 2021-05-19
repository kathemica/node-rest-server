import dotenv from "dotenv";
import _ from "lodash";

let PORT;
let ATLAS_MONGO_URL;
let CA_CERT = "";
let KEY_CERT = "";
let PEM_CERT = "";
let CA_TOKEN = "";
let IS_TLS = false;
let SECRETJWT = "";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();

  CA_CERT = process.env.CA_CERT || "";
  KEY_CERT = process.env.KEY_CERT || "";
  PEM_CERT = process.env.PEM_CERT || "";
  CA_TOKEN = process.env.CA_TOKEN || "";
  IS_TLS = _.isEqual(process.env.IS_TLS, "true") ? true : false;
  SECRETJWT = process.env.SECRETJWT;
}

PORT = process.env.PORT || 8080;
ATLAS_MONGO_URL = process.env.ATLAS_MONGO_URL;

export {
  PORT,
  ATLAS_MONGO_URL,
  CA_CERT,
  CA_TOKEN,
  KEY_CERT,
  PEM_CERT,
  IS_TLS,
  SECRETJWT,
};
