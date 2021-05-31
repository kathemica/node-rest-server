import jwt from 'jsonwebtoken';
import { jwtConfig, logger } from '../config/index.js';

const generateJWT = (uuid = '') => {
  return new Promise((resolve, reject) => {
    const payload = { uuid };

    jwt.sign(payload, jwtConfig.SECRET, { expiresIn: jwtConfig.accessExpirationMinutes }, (err, token) => {
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

// eslint-disable-next-line import/prefer-default-export
export { generateJWT };

// TODO: se debe sumar tiempo de sesión a cada usuario cuando el token lo está usando
