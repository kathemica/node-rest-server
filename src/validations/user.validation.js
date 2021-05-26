import httpStatus from 'http-status';

import { validateRoles } from './roles.validation.js';
import { ApiError } from '../utils/index.js';
import { Users } from '../models/index.js';

const validateUser = async (uuid = '', requiredRoles = '') => {
  try {
    if (!uuid) {
      throw new ApiError(httpStatus.PRECONDITION_FAILED, 'User ID is required');
    }

    const user = await Users.findOne({ _id: uuid, isActive: true });

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'A valid user is required to perform this action');
    } else {
      validateRoles(user, requiredRoles);
    }

    return user;
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
};

// eslint-disable-next-line import/prefer-default-export
export { validateUser };
