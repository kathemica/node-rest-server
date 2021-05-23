import _ from "lodash";
import httpStatus from "http-status";
import validateJWT from "../validations/jwt.validation.js";
import validateUser from "../validations/user.validation.js";
import responseObjectBuilder from "../helpers/functions.helper.js";
import ApiError from "../helpers/ApiError.js";

const auth = (...requiredRoles) => async (req, res, next) => {    
    try {        
        const userUUID = await validateJWT(req.header('x-auth-token'));                 
                
        const user = await validateUser(userUUID, requiredRoles);

        if (_.isNil(user)) {throw new ApiError(httpStatus.UNAUTHORIZED, 'A valid user is required to perform this action')}            
        
        if (!_.isEqual(req.header('x-auth-token'), user.token)) {throw new ApiError(httpStatus.UNAUTHORIZED, 'Token expired or invalid')}                    
        
        req.user = user;

        next();        
    } catch (error) {
        console.log("Auth error");
        return responseObjectBuilder(res, error.statusCode, 'Error', `Auth fails`, error.message);
    }    
}

export default auth;