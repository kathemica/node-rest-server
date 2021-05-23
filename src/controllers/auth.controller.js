import { response } from "express";
import bcryptjs from "bcryptjs";
import _ from "lodash";
import httpStatus from "http-status";

import { generateJWT } from "../helpers/generate-jwt.js";
import Users from "../models/User.model.js";
import responseObjectBuilder from "../helpers/functions.helper.js";
import googleVerify from "../helpers/google-verify.js";
import ApiError from "../helpers/ApiError.js";
import logger from "../config/logger.js";

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const authLogin = async (req, res = response) => {
  try {
    const { email, password } = req.body;

    let user = await Users.findOne({ email: email, isActive: true });

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is disabled or doesn\'t exists');      
    }

    const isValidPassword = bcryptjs.compareSync(password, user.password);

    if (!isValidPassword) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is invalid');      
    }

    user.token = await generateJWT(user.id);    

    user = await Users.findByIdAndUpdate(user.id, {token: user.token}, {
      returnOriginal: false,
    });    

    return responseObjectBuilder(res, httpStatus.OK, "Success", `Login success`, "", {
      user,
      token: user.token,
    });

  } catch (error) {
    logger.error("Login failure");
    return responseObjectBuilder(res, error.statusCode, `Error`, `Login failure`, error.message);
  }
};

//TODO: finalizar este método
const authLogout = async (req, res = response) => {
  try {
    const { email, password } = req.body;

    let user = await Users.findOne({ email: email, isActive: true });

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is disabled or doesn\'t exists');      
    }

    const isValidPassword = bcryptjs.compareSync(password, user.password);

    if (!isValidPassword) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is invalid');      
    }

    user.token = await generateJWT(user.id);    

    user = await Users.findByIdAndUpdate(user.id, {token: user.token}, {
      returnOriginal: false,
    });    

    return responseObjectBuilder(res, httpStatus.OK, "Success", `Logout success`, '', {
      user,
      token: user.token,
    });

  } catch (error) {   
    logger.error("Logout failure"); 
    return responseObjectBuilder(res, error.statusCode, `Error`, `Logout failure`, error.message );
  }
};

const authGoogleLogin = async (req, res = response) => {
  try {
    const { id_token } = req.body;    

    const {firstName, lastName, email, image} = await googleVerify(id_token); 

    let user = await Users.findOne({email});

    if (!user){
      const data={
        firstName, 
        lastName,
        email,
        password: '!"#$%&/()',
        image,
        isGoogle: true
      }

      user = new Users(data);
      await user.save();
    }; 
    
    if(!user.isActive){
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is disabled'); 
    }

    const token = await generateJWT(user.id);

    return responseObjectBuilder(res, httpStatus.OK, "Success", "Google Auth success", '', {user, token});    
  } catch (error) {
    logger.error("Google login failure");
    return responseObjectBuilder(res, error.statusCode, `Error`, `Google auth failure`, error.message );
  }
}

export { authLogin, authGoogleLogin, authLogout };