import { response } from "express";
import bcryptjs from "bcryptjs";
import _ from "lodash";
import httpStatus from "http-status";

import { generateJWT } from "../helpers/generate-jwt.js";
import Users from "../models/User.model.js";
import responseObjectBuilder from "../helpers/functions.helper.js";
import googleVerify from "../helpers/google-verify.js";
import ApiError from "../helpers/ApiError.js";

//get one uses
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

    return responseObjectBuilder(res, 200, true, "Success", "", {
      user,
      token: user.token,
    });

  } catch (error) {    
    return responseObjectBuilder(res, error.statusCode, true, error.message);
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

    return responseObjectBuilder(res, 200, true, "Success", "Google Auth success", {user, token});    
  } catch (error) {

    return responseObjectBuilder(res, error.statusCode, true, error.message);
  }
}

export { authLogin, authGoogleLogin };