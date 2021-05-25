import jwt from 'jsonwebtoken';
import moment from 'moment-timezone';
import httpStatus from 'http-status';

import { ApiError } from '../utils/index.js';
import { jwtConfig, logger, tokenTypes } from '../config/index.js';
import { Token } from '../models/index.js';
// import { tokenTypes } from '../config/tokens.enum.js';
// import userService from './user.service';

//------------------------------------------------------------
/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, fingerprint, expires, type = '', blacklisted = false) => {
  try {
    const tokenDoc = await Token.create({
      token,
      user: userId,
      fingerprint,
      expires: expires.toDate(),
      type,
      blacklisted,
    });

    return tokenDoc;
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token = '', type = tokenTypes, fingerprint = '') => {
  try {
    const payload = jwt.verify(token, jwtConfig.secret);

    const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false, fingerprint });

    if (!tokenDoc) {
      throw new Error('Token not found');
    }

    return tokenDoc;
  } catch (err) {
    logger.error(err);
    throw new ApiError(httpStatus.UNAUTHORIZED, `Failure on Security Token [${err}]`);
  }
};

//------------------------------------------------------------
/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} [secret]
 * @returns {string}
 */
// TODO: estos tokens no se almacenan, deben vencer rapido
const getAccessToken = (uuid, expires, type, secret = jwtConfig.secret) => {
  const payload = {
    sub: uuid,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

//------------------------------------------------------------
/**
 * Generate auth tokens
 * @param {User} user
 * @param {string} fingerprint
 * @returns {Promise<Object>}
 */
const getRefreshToken = async (user, fingerprint) => {
  // validate that the user does not have more than 5 refresh token, nor more than 1 RT per device
  const queries = {
    RTTotalGeneral: { user: user.id, type: tokenTypes.REFRESH },
    RTTotalWithSameFingerprint: { user: user.id, fingerprint, type: tokenTypes.REFRESH },
    ATTotalWithSameFingerprint: { user: user.id, fingerprint, type: tokenTypes.ACCESS },
  };

  const [RTTotalGeneral, RTTotalWithSameFingerprint, ATTotalWithSameFingerprint] = await Promise.all([
    await Token.countDocuments(queries.RTTotalGeneral),
    await Token.countDocuments(queries.RTTotalWithSameFingerprint),
    await Token.countDocuments(queries.ATTotalWithSameFingerprint),
  ]);

  // RT
  // We validate that it does not have more than 5 RTs in total, else we delete them to create a new one
  if (RTTotalGeneral >= 5) {
    await Token.deleteMany(queries.RTTotalGeneral, (err) => {
      if (err) logger.error(err);
      logger.info(
        `User: ${user.id} was trying to create more than 5 refresh tokens, therefore all of those were erades and created a new one`
      );
    });
  }

  if (RTTotalWithSameFingerprint > 0) {
    await Token.deleteMany(queries.RTTotalWithSameFingerprint, (err) => {
      if (err) logger.error(err);
      logger.info(
        `User: ${user.id} was trying to create more than 1 refresh tokens for the same device, therefore all of those were erades and created a new one`
      );
    });
  }

  if (ATTotalWithSameFingerprint > 0) {
    await Token.deleteMany(queries.ATTotalWithSameFingerprint, (err) => {
      if (err) logger.error(err);
      logger.info(
        `User: ${user.id} was trying to create more than 1 access tokens for the same device, therefore all of those were erades and created a new one`
      );
    });
  }

  // AT
  // We validate that it do not have more than one AT per fingerprint
  const accessTokenExpires = moment().add(jwtConfig.accessExpirationMinutes, 'minutes');

  const accessToken = getAccessToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  await saveToken(accessToken, user.id, fingerprint, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(jwtConfig.refreshExpirationDays, 'days');

  const refreshToken = getAccessToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);

  await saveToken(refreshToken, user.id, fingerprint, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.utc(true).toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.utc(true).toDate(),
    },
  };
};

//------------------------------------------------------------
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

// /**
//  * Save a token
//  * @param {string} token
//  * @param {ObjectId} userId
//  * @param {Moment} expires
//  * @param {string} type
//  * @param {boolean} [blacklisted]
//  * @returns {Promise<Token>}
//  */
// const saveToken = async (token, userId, expires, type, blacklisted = false) => {
//   const tokenDoc = await Token.create({
//     token,
//     user: userId,
//     expires: expires.toDate(),
//     type,
//     blacklisted,
//   });
//   return tokenDoc;
// };

// /**
//  * Verify token and return token doc (or throw an error if it is not valid)
//  * @param {string} token
//  * @param {string} type
//  * @returns {Promise<Token>}
//  */
// const verifyToken = async (token, type) => {
//   const payload = jwt.verify(token, jwtConfig.secret);
//   const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
//   if (!tokenDoc) {
//     throw new Error('Token not found');
//   }
//   return tokenDoc;
// };

// /**
//  * Generate auth tokens
//  * @param {User} user
//  * @returns {Promise<Object>}
//  */
// const getRefreshToken = async (user) => {
//   const accessTokenExpires = moment().add(jwtConfig.accessExpirationMinutes, 'minutes');
//   const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

//   const refreshTokenExpires = moment().add(jwtConfig.refreshExpirationDays, 'days');
//   const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
//   await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

//   return {
//     access: {
//       token: accessToken,
//       expires: accessTokenExpires.toDate(),
//     },
//     refresh: {
//       token: refreshToken,
//       expires: refreshTokenExpires.toDate(),
//     },
//   };
// };

// /**
//  * Generate reset password token
//  * @param {string} email
//  * @returns {Promise<string>}
//  */
// const generateResetPasswordToken = async (email) => {
//   const user = await userService.getUserByEmail(email);
//   if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
//   }
//   const expires = moment().add(jwtConfig.resetPasswordExpirationMinutes, 'minutes');
//   const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
//   await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
//   return resetPasswordToken;
// };

// /**
//  * Generate verify email token
//  * @param {User} user
//  * @returns {Promise<string>}
//  */
// const generateVerifyEmailToken = async (user) => {
//   const expires = moment().add(jwtConfig.verifyEmailExpirationMinutes, 'minutes');
//   const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
//   await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
//   return verifyEmailToken;
// };

// eslint-disable-next-line import/prefer-default-export
export {
  generateJWT,
  getAccessToken,
  getRefreshToken,
  verifyToken,
  // saveToken,
  // verifyToken,
  // getRefreshToken,
  // generateResetPasswordToken,
  // generateVerifyEmailToken,
};
