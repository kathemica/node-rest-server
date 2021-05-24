import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/config.app.js';
import logger from '../config/logger.js';

const generateJWT = (uuid = '') => {
  return new Promise((resolve, reject) => {
    const payload = { uuid };

    jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.accessExpirationMinutes }, (err, token) => {
      if (err) {
        logger.error(err);
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(`Couldn't generate jwt token`);
      } else {
        resolve(token);
      }
    });
  });
};

export default generateJWT;
// TODO: se debe sumar tiempo de sesión a cada usuario cuando el token lo está usando
