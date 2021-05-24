import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';

import { ApiError } from '../utils/index.js';
import { jwtConfig } from '../config/index.js';

const validateJWT = async (token = '') => {
  try {
    if (!token) {
      throw new ApiError(httpStatus.PRECONDITION_FAILED, 'Security token is required');
    }

    // invalid token - synchronous
    try {
      const { uuid } = jwt.verify(token, jwtConfig.secret);

      return uuid;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Error on Security Token');
    }
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
};

// eslint-disable-next-line import/prefer-default-export
export { validateJWT };
