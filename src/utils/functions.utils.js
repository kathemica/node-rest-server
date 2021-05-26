import _ from 'lodash';
import httpStatus from 'http-status';
import { response } from 'express';

import { ApiError } from './ApiError.utils.js';
import { languageTypes } from '../config/index.js';

const responseObjectBuilder = (
  res = response,
  code = 501,
  output = 'Not defined',
  message = '',
  details = '',
  body = {}
) => {
  return res.status(code).json({
    header: {
      code,
      output,
      message,
      details,
    },
    body,
  });
};

/**
 * Returns Languague from Languague header
 */
const checkLanguageHeader = (req) => {
  try {
    if (
      _.isNil(req.header('Accept-Language')) ||
      _.isNaN(req.header('Accept-Language')) ||
      _.isEmpty(req.header('Accept-Language'))
    ) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Accept-Language is required');
    } else if (!Object.values(languageTypes).includes(req.header('Accept-Language'))) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Language [${req.header('Accept-Language')}] not supported`);
    }
    return req.header('Accept-Language');
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
};

/**
 * Returns token from Authorization header
 */
const checkAutorizationHeader = (req) => {
  try {
    // console.log(req.header('Authorization'));

    if (
      _.isNil(req.header('Authorization')) ||
      _.isNaN(req.header('Authorization')) ||
      _.isEmpty(req.header('Authorization'))
    ) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Autorization token is required');
    }

    if (!req.header('Authorization').startsWith('Bearer')) throw new ApiError(httpStatus.UNAUTHORIZED, 'Token is invalid');

    return req.header('Authorization').slice(7, req.header('Authorization').length);
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
};

// eslint-disable-next-line import/prefer-default-export
export { responseObjectBuilder, checkLanguageHeader, checkAutorizationHeader };
