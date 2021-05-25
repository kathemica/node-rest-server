import { response } from 'express';
import bcryptjs from 'bcryptjs';
import httpStatus from 'http-status';

import { Users } from '../models/index.js';
import { logger } from '../config/index.js';
import { responseObjectBuilder, googleVerify, ApiError } from '../utils/index.js';
import { generateJWT, getRefreshToken } from '../services/token.service.js';

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
    // logger.info('login');
    const tokenTupla = await getRefreshToken(user, req.fingerprint.hash);

    // user = await Users.findByIdAndUpdate(
    //   user.id,
    //   { tokens: tokenTupla, fingerprint: req.fingerprint.hash },
    //   { returnOriginal: false }
    // );
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

// TODO: finalizar este método
const logout = async (req, res = response) => {
  try {
    const { email, password } = req.body;

    let user = await Users.findOne({ email, isActive: true });

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Account is disabled or doesn't exists");
    }

    const isValidPassword = bcryptjs.compareSync(password, user.password);

    if (!isValidPassword) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is invalid');
    }

    user.token = await generateJWT(user.id);

    user = await Users.findByIdAndUpdate(
      user.id,
      { token: user.token },
      {
        returnOriginal: false,
      }
    );

    return responseObjectBuilder(res, httpStatus.OK, 'Success', `Logout success`, '', {
      user,
      token: user.token,
    });
  } catch (error) {
    logger.error('Logout failure');
    return responseObjectBuilder(res, error.statusCode, `Error`, `Logout failure`, error.message);
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

export { login, loginGoogle, logout };
