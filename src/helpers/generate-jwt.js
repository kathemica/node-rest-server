import jwt from "jsonwebtoken";
import { jwt_config } from "../config/config.app.js";
import logger from "../config/logger.js";

const generateJWT = (uuid = "") => {
  return new Promise((resolve, reject) => {
    const payload = { uuid };    

    jwt.sign(payload, jwt_config.secret, {expiresIn: jwt_config.accessExpirationMinutes},
      (err, token) => {
        if (err) {
                    
          logger.error(err)
          reject(`Couldn't generate jwt token`);
        } else {
          resolve(token);
        }
      }
    );
  });
};

export { generateJWT };

//TODO: se debe sumar tiempo de sesión a cada usuario cuando el token lo está usando
