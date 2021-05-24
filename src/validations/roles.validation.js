import _ from 'lodash';
import httpStatus from 'http-status';

import { ApiError } from '../utils/index.js';

const validateRoles = (user = null, requiredRoles = []) => {
  try {
    if (_.isNil(user)) {
      throw new ApiError(httpStatus.PRECONDITION_FAILED, `User can't be null`);
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ApiError(httpStatus.UNAUTHORIZED, `User must have a valid role to perfom this action: ${requiredRoles}`);
    }

    return true;
  } catch (error) {
    throw new ApiError(error.statusCode, error.message);
  }
};


// eslint-disable-next-line import/prefer-default-export
export { validateRoles };
// export default validateRoles;
