// import { request, response } from "express";
import _ from 'lodash';
import httpStatus from 'http-status';
// import responseObjectBuilder from "../helpers/functions.helper.js";
import ApiError from '../helpers/ApiError.js';

// const validateAdminRole = (req, res = response, next) => {
//   if (!req.user) {
//     return responseObjectBuilder(
//       res,
//       500,
//       true,
//       "Failure",
//       "Token must be validate first"
//     );
//   }

//   if (!_.isEqual(req.user.role, "ADMIN_ROLE")) {
//     return responseObjectBuilder(
//       res,
//       401,
//       true,
//       "Failure",
//       "User is not Admin",
//       null
//     );
//   }

//   next();
// };

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

export default validateRoles;
