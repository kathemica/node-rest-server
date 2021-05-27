import httpStatus from 'http-status';
import _ from 'lodash';
import { logger } from '../config/index.js';
import { ApiError, checkLanguageHeader, checkAutorizationHeader, responseObjectBuilder } from '../utils/index.js';
import { validateUser } from '../validations/index.js';
import { verifyToken } from '../services/token.service.js';

const authorize =
  (tokenType, ...requiredRoles) =>
  async (req, res, next) => {
    try {
      req.language = checkLanguageHeader(req);

      const token = checkAutorizationHeader(req);

      const fingerprint = req.fingerprint.hash;

      const tokenInfo = await verifyToken(token, tokenType, fingerprint);

      const user = await validateUser(tokenInfo.user, requiredRoles);

      if (_.isNil(user)) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'A valid user is required to perform this action');
      }

      if (!_.isEqual(token, tokenInfo.token)) {
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
