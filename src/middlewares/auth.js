import httpStatus from 'http-status';
import _ from 'lodash';
import { logger, tokenTypes, languajeTypes } from '../config/index.js';
import { ApiError, responseObjectBuilder } from '../utils/index.js';
import { validateUser } from '../validations/index.js';
import { verifyToken } from '../services/token.service.js';

const authorize =
  (...requiredRoles) =>
  async (req, res, next) => {
    try {
      if (
        _.isNil(req.header('Accept-Language')) ||
        _.isNaN(req.header('Accept-Language')) ||
        _.isEmpty(req.header('Accept-Language'))
      ) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Accept-Language is required');
      } else if (!Object.values(languajeTypes).includes(req.header('Accept-Language'))) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Language [${req.header('Accept-Language')}] not supported`);
      }

      if (
        _.isNil(req.header('Authorization')) ||
        _.isNaN(req.header('Authorization')) ||
        _.isEmpty(req.header('Authorization'))
      ) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Autorization token is required');
      }

      if (!req.header('Authorization').startsWith('Bearer')) throw new ApiError(httpStatus.UNAUTHORIZED, 'Token is invalid');

      const token = req.header('Authorization').slice(7, req.header('Authorization').length);

      const fingerprint = req.fingerprint.hash;

      const tokenInfo = await verifyToken(token, tokenTypes.ACCESS, fingerprint);

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
// export default auth;
