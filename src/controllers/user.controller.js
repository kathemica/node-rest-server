import { response } from "express";
import bcryptjs from "bcryptjs";
import _ from "lodash";
import Users from "../models/User.model.js";
import responseObjectBuilder from "../helpers/functions.helper.js";
import httpStatus from "http-status";
import ApiError from "../helpers/ApiError.js";
import logger from '../config/logger.js';

//get one uses
const userGetOne = async (req, res = response) => {
  try {
    const { id } = req.params;

    const user = await Users.findById(id);

    return responseObjectBuilder(res, httpStatus.OK, true, `Success`, `Get one success`, user);
  } catch (error) {
    logger.error(`Error: ${error}`);
    return responseObjectBuilder(res, httpStatus.INTERNAL_SERVER_ERROR, `Error`, `Get one failure`, error.message);
  }
};

//get all users with pagination
const userGet = async (req, res = response) => {
  try {
    //object destructuration
    const { limit = 5, from = 0 } = req.query;

    const query = { isActive: true };

    //array destructuration
    const [total, users] = await Promise.all([
      Users.countDocuments(query),
      Users.find(query).skip(Number(from)).limit(Number(limit)),
    ]);

    return responseObjectBuilder(res, httpStatus.OK, `Success`, `Get all success`, "", {
      total,
      users,
    });
  } catch (error) {
    logger.error(`Error: ${error}`);
    return responseObjectBuilder(res, httpStatus.INTERNAL_SERVER_ERROR, `Error`, `Get all failure`, error.message);
  }
};

//create a new user
const userPost = async (req, res = response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const user = new Users({ firstName, lastName, email, password, role });

    //encript pass
    const salt = bcryptjs.genSaltSync();
    user.password = bcryptjs.hashSync(password, salt);

    await user.save();

    return responseObjectBuilder(res, httpStatus.OK, `Success`, `Create success`,  "", user);
  } catch (error) {
    logger.error(`Error: ${error}`);
    return responseObjectBuilder(res, httpStatus.INTERNAL_SERVER_ERROR, `Error`, `Create failure`, error.message);
  }
};

//update a user
const userPatch = async (req, res = response) => {
  try {
    const { id } = req.params;

    const { _id, password, ...data } = req.body;

    if (password) {
      const salt = bcryptjs.genSaltSync();
      data.password = bcryptjs.hashSync(password, salt);
    }

    const user = await Users.findByIdAndUpdate(id, data, {
      returnOriginal: false,
    });

    return responseObjectBuilder(
      res,
      httpStatus.OK,
      `Success`,
      `Update success`, 
      !_.isUndefined(data.isGoogle)
        ? "'Google tag' field is readonly, won't be changed"
        : "",
      user
    );
  } catch (error) {
    logger.error(`Error: ${error}`);
    return responseObjectBuilder(res, httpStatus.INTERNAL_SERVER_ERROR, `Error`, `Update failure`, error.message);
  }
};

//Delete a user
const userDelete = async (req, res = response) => {
  try {
    const { id } = req.params;    

    const user = await Users.findByIdAndUpdate(
      id,
      { isActive: false },
      { returnOriginal: false }
    );

    return responseObjectBuilder(
      res,
      httpStatus.OK,      
      `Success`,
      'Delete success',
      "Objects aren't permanently erased from database, they're just disabled.",
      user
    );
  } catch (error) {
    logger.error(`Error: ${error}`);    
    return responseObjectBuilder(res, httpStatus.INTERNAL_SERVER_ERROR, `Error`, `Delete failure`, error.message);
  }
};

export { userGet, userGetOne, userPost, userPatch, userDelete };
