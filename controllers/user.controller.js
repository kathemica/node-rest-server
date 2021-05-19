import { response } from "express";
import bcryptjs from "bcryptjs";
import _ from "lodash";
import Users from "../models/User.model.js";
import responseObjectBuilder from "../helpers/functions.helper.js";

//get one uses
const userGetOne = async (req, res = response) => {
  try {
    const { id } = req.params;

    const user = await Users.findById(id);

    return responseObjectBuilder(res, 200, true, `Success`, "", user);
  } catch (error) {
    console.log(`Error: ${error}`);
    return responseObjectBuilder(
      res,
      500,
      true,
      error.message,
      error.name,
      error.errors
    );
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

    return responseObjectBuilder(res, 200, true, `Success`, "", {
      total,
      users,
    });
  } catch (error) {
    console.log(`Error: ${error}`);
    return responseObjectBuilder(
      res,
      500,
      true,
      error.message,
      error.name,
      error.errors
    );
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

    return responseObjectBuilder(res, 200, true, `Success`, "", user);
  } catch (error) {
    console.log(`Error: ${error}`);
    return responseObjectBuilder(
      res,
      500,
      true,
      error.message,
      error.name,
      error.errors
    );
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
      200,
      true,
      `Success`,
      !_.isUndefined(data.isGoogle)
        ? "'Google tag' field is readonly, won't be changed"
        : "",
      user
    );
  } catch (error) {
    console.log(`Error: ${error}`);
    return responseObjectBuilder(
      res,
      500,
      true,
      error.message,
      error.name,
      error.errors
    );
  }
};

//Delete a user
const userDelete = async (req, res = response) => {
  try {
    const { id } = req.params;

    // console.log(adminUser);

    const user = await Users.findByIdAndUpdate(
      id,
      { isActive: false },
      { returnOriginal: false }
    );

    return responseObjectBuilder(
      res,
      200,
      true,
      `Success`,
      "Object won't be deleted permanently, just disabled",
      user
    );
  } catch (error) {
    console.log(`Error: ${error}`);
    return responseObjectBuilder(
      res,
      500,
      true,
      error.message,
      error.name,
      error.errors
    );
  }
};

export { userGet, userGetOne, userPost, userPatch, userDelete };
