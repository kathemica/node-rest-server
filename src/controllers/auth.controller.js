import { request, response } from 'express';
import bcryptjs from 'bcryptjs';
import httpStatus from 'http-status';
import moment from 'moment';

import { Users } from '../models/index.js';
import { jwtConfig, logger, tokenTypes } from '../config/index.js';
import { responseObjectBuilder, googleVerify, ApiError, checkAutorizationHeader } from '../utils/index.js';
import {
  generateJWT,
  getRefreshToken,
  deleteUserTokens,
  verifyToken,
  getAccessToken,
  saveToken,
} from '../services/token.service.js';

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const login = async (req, res = response) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ email, isActive: true });

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Account is disabled or doesn't exists");
    }

    const isValidPassword = bcryptjs.compareSync(password, user.password);

    if (!isValidPassword) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is invalid');
    }

    // TODO: se deben enviar los tokens de acceso y refresh generados, el refresh se almacena
    // y se valida su fingerprint para que corresponda con el refresh
    const tokenTupla = await getRefreshToken(user, req.fingerprint.hash);

    res.setHeader('Autorization', `Bearer ${tokenTupla.access.token}`);
    return responseObjectBuilder(res, httpStatus.OK, 'Success', `Login success`, '', {
      user,
      tokens: tokenTupla,
    });
  } catch (error) {
    logger.error('Login failure');
    return responseObjectBuilder(res, error.statusCode, `Error`, `Login failure`, error.message);
  }
};
/**
 * Logout with user and fingerprint
 * @param {request} req
 * @param {response} res
 * @returns {Promise<User>}
 */
const logout = async (req = request, res = response) => {
  try {
    const { user } = req;

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, `There's no user to logout!!`);
    }

    const fingerprint = req.fingerprint.hash;

    await deleteUserTokens({ user: user.id, fingerprint });

    return responseObjectBuilder(res, httpStatus.OK, 'Success', `Logout success`, '', user);
  } catch (error) {
    logger.error('Logout failure');
    return responseObjectBuilder(res, error.statusCode || 500, `Error`, `Logout failure`, error.message);
  }
};

/**
 * Get a new access token using refresh token
 * @param {request} req
 * @param {response} res
 * @returns {Promise<User>}
 */
const reAuthenticate = async (req = request, res = response) => {
  try {
    const { user } = req;

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, `There's no user to refresh!!`);
    }

    const token = checkAutorizationHeader(req);
    const fingerprint = req.fingerprint.hash;

    const tokenDoc = await verifyToken(token, tokenTypes.REFRESH, fingerprint);

    await deleteUserTokens({ user: tokenDoc.user, fingerprint, type: tokenTypes.ACCESS });

    // AT
    // We validate that it do not have more than one AT per fingerprint
    const accessTokenExpires = moment().add(jwtConfig.accessExpirationMinutes, 'minutes');
    const accessToken = getAccessToken(tokenDoc.user, accessTokenExpires, tokenTypes.ACCESS);
    await saveToken(accessToken, tokenDoc.user, fingerprint, accessTokenExpires, tokenTypes.ACCESS);

    res.setHeader('Autorization', `Bearer ${accessToken}`);
    return responseObjectBuilder(res, httpStatus.OK, 'Success', `Token refresh`, '', {
      user,
      tokens: {
        access: {
          token: accessToken,
          expires: accessTokenExpires.utc(true).toDate(),
        },
        refresh: null,
      },
    });
  } catch (error) {
    logger.error(error);
    return responseObjectBuilder(res, error.statusCode, `Error`, `Refresh Token failure: `, error.message);
  }
};

const loginGoogle = async (req, res = response) => {
  try {
    // eslint-disable-next-line camelcase
    const { id_token } = req.body;

    const { firstName, lastName, email, image } = await googleVerify(id_token);

    let user = await Users.findOne({ email });

    if (!user) {
      const data = {
        firstName,
        lastName,
        email,
        password: '!"#$%&/()',
        image,
        isGoogle: true,
      };

      user = new Users(data);
      await user.save();
    }

    if (!user.isActive) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is disabled');
    }

    const token = await generateJWT(user.id);

    return responseObjectBuilder(res, httpStatus.OK, 'Success', 'Google Auth success', '', { user, token });
  } catch (error) {
    logger.error('Google login failure');
    return responseObjectBuilder(res, error.statusCode, `Error`, `Google auth failure`, error.message);
  }
};

export { login, loginGoogle, logout, reAuthenticate };
