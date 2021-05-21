import { response } from "express";
import responseObjectBuilder from "../helpers/functions.helper.js";
import _ from "lodash";

const isUserDefined = (user = null, res = response) => {
  if (!user) {
    return responseObjectBuilder(
      res,
      500,
      true,
      "Failure",
      "Token must be validate first"
    );
  } else {
    return;
  }
};

const validateAdminRole = (req, res = response, next) => {
  if (!req.user) {
    return responseObjectBuilder(
      res,
      500,
      true,
      "Failure",
      "Token must be validate first"
    );
  }

  if (!_.isEqual(req.user.role, "ADMIN_ROLE")) {
    return responseObjectBuilder(
      res,
      401,
      true,
      "Failure",
      "User is not Admin",
      null
    );
  }

  next();
};

const validateSpecificRoles = (...rolesToCheck) => {
  return (req, res = response, next) => {
    isUserDefined(req.user, res);
    // console.log(req.user.role);

    // console.log(rolesToCheck.includes(req.user.role));

    if (!rolesToCheck.includes(req.user.role)) {
      return responseObjectBuilder(
        res,
        401,
        true,
        "Failure",
        `User must have be: ${rolesToCheck}`,
        null
      );
    }
    next();
  };
};

export default validateSpecificRoles;
export { 
    validateAdminRole    
};
