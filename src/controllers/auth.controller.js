import { response } from "express";
import bcryptjs from "bcryptjs";
import _ from "lodash";

import { generateJWT } from "../helpers/generate-jwt.js";
import Users from "../models/User.model.js";
import responseObjectBuilder from "../helpers/functions.helper.js";
import googleVerify from "../helpers/google-verify.js";

//get one uses
const authLogin = async (req, res = response) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ email: email, isActive: true });

    if (!user) {
      return responseObjectBuilder(
        res,
        400,
        true,
        "Failure",
        "Account is disabled or doesn't exists",
        null
      );
    }

    const isValidPassword = bcryptjs.compareSync(password, user.password);

    if (!isValidPassword) {
      return responseObjectBuilder(
        res,
        400,
        true,
        "Failure",
        "Password is invalid",
        null
      );
    }

    const token = await generateJWT(user.id);

    return responseObjectBuilder(res, 200, true, "Success", "", {
      user,
      token,
    });

  } catch (error) {
    console.log(`Error: ${error}`);

    return responseObjectBuilder(
      res,
      500,
      true,
      'Failure',
      error.message,
      error
    );
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
      throw new Error('User is inactive, can\'t login');
    }

    const token = await generateJWT(user.id);

    return responseObjectBuilder(res, 200, true, "Success", "Google Auth success", {user, token});    
  } catch (error) {
    console.log(`Error: ${error}`);

    return responseObjectBuilder(
      res,
      400,
      true,
      'Failure',
      error.message,
      error
    );
  }
}

export { authLogin, authGoogleLogin };