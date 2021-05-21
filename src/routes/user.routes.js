import { Router } from "express";
import { check } from "express-validator";

import {
  validateJWT,
  fieldValidation,
  validateSpecificRoles
} from "../middlewares/index.js";

import {
  isValidRol,
  isEmailUnique,
  existsID,
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
  .get(userGet)
  .post([
      check("firstName", "First name is required").not().isEmpty(),
      check("lastName", "Last name is required").not().isEmpty(),
      check("email", "Invalid email").isEmail(),
      check("email").custom(isEmailUnique),
      check("password", "Password should be greather than 6 chars").isLength({
        min: 6,
      }),
      check("role").custom(isValidRol),
      fieldValidation,
    ],
    userPost
  );

router
  .route('/:id') 
  .get(  
    [
      check("id", "Id is not valid").isMongoId(),
      check("id").custom(existsID),
      fieldValidation,
    ],
    userGetOne
  )
  .patch(
    [
      check("id", "Id is not valid").isMongoId(),
      check("id").custom(existsID),
      check("email", "Invalid email").optional().isEmail(),
      check("password", "Password should be greather than 6 chars")
        .optional()
        .isLength({ min: 6 }),
      check("role").optional().custom(isValidRol),
      fieldValidation,
    ],
    userPatch
  )
  .delete(
    [
      validateJWT,
      validateSpecificRoles("ADMIN_ROLE"),
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