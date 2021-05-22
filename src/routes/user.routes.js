import { Router } from "express";
import { check } from "express-validator";
import auth from "../middlewares/auth.js";
import fieldValidation from "../validations/fields.validation.js";

import {
  isValidRol,
  isEmailUnique,
  existsID,
  weakPassword,
} from "../helpers/db-validators.js";

import {
  userGet,
  userGetOne,
  userPost,
  userPatch,
  userDelete,
} from "../controllers/user.controller.js";

const router = Router();

router
  .route('/')
  .get([
      auth("ADMIN_ROLE", "USER_ROLE", "SALES_ROLE")
    ],userGet)
  .post([
      auth("ADMIN_ROLE"),
      check("firstName", "First name is required").not().isEmpty(),
      check("lastName", "Last name is required").not().isEmpty(),
      check("email", "Invalid email").isEmail(),
      check("email").custom(isEmailUnique),            
      check("password").custom(weakPassword),
      check("role").custom(isValidRol),
      fieldValidation,
    ],
    userPost
  );

router
  .route('/:id') 
  .get(  
    [
      auth("ADMIN_ROLE", "USER_ROLE", "SALES_ROLE"),
      check("id", "Id is not valid").isMongoId(),
      check("id").custom(existsID),
      fieldValidation,
    ],
    userGetOne
  )
  .patch(
    [
      auth("ADMIN_ROLE"),
      check("id", "Id is not valid").isMongoId(),
      check("id").custom(existsID),
      check("email", "Invalid email").optional().isEmail(),
      check("email").optional().custom(isEmailUnique),
      check("password").optional().custom(weakPassword),      
      check("role").optional().custom(isValidRol),
      fieldValidation,
    ],
    userPatch
  )
  .delete(
    [
      auth("ADMIN_ROLE"),
      check("id", "Id is empty").not().isEmpty(),
      check("id", "Id is not valid").isMongoId(),
      check("id").custom(existsID),
      fieldValidation,
    ],
    userDelete
  );

export { router as userRouter };

/**
 * @openapi
 * /:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */