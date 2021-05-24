import _ from 'lodash';
import httpStatus from 'http-status';

import { logger } from '../config/index.js';
import { ApiError, responseObjectBuilder } from '../utils/index.js';
import { validateJWT, validateUser } from '../validations/index.js';

const authorize =
  (...requiredRoles) =>
  async (req, res, next) => {
    try {
      const userUUID = await validateJWT(req.header('x-auth-token'));

      const user = await validateUser(userUUID, requiredRoles);

      if (_.isNil(user)) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'A valid user is required to perform this action');
      }

      if (!_.isEqual(req.header('x-auth-token'), user.token)) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Token expired or invalid');
      }

      req.user = user;

      next();
    } catch (error) {
      logger.error('Auth error');
      return responseObjectBuilder(res, error.statusCode, 'Error', `Auth fails`, error.message);
    }
  };

// eslint-disable-next-line import/prefer-default-export
export { authorize };
// export default auth;
