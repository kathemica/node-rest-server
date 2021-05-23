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

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User handeling
 */

/**
 * @swagger
 * /api/users/:
 *   get:
 *     tags: [User] 
 *     summary: /
 *     description: Get all users, auth for ADMIN_ROLE, USER_ROLE
 *     consumes:
 *       - application/json 
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *           type: string
 *           format: jwt
 *         required: true
 *     responses:
 *       "200":
 *          description: When operation is success
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  header: 
 *                    $ref: '#/components/schemas/ResponseHeader'
 *                  body:                   
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/UserLight'
 *       "400":
 *         $ref: '#/components/responses/IDTokenRequired'
 *       "500":
 *         $ref: '#/components/schemas/Error'  
 *   post:
 *     tags: [User] 
 *     summary: /
 *     description: Create a user, auth for ADMIN_ROLE
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *           type: string
 *           format: jwt
 *         required: true      
  *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - role
 *               - isActive
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *               isActive:
 *                 type: boolean 
 *             example:
 *               firstName: Fulanito
 *               lastName: Detal
 *               email: fake@example.com
 *               password: auausasdasdsasda
 *               role:  [ADMIN_ROLE, USER_ROLE]           
 *               isActive: [true, false]
 *     responses:
 *       "200":
 *         $ref: '#/components/responses/Success200'
 *       "400":
 *         $ref: '#/components/responses/IDTokenRequired'
 *       "500":
 *         $ref: '#/components/schemas/Error'       
 */

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

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [User] 
 *     summary: /{id}
 *     description: Get specific user by id, auth for ADMIN_ROLE, USER_ROLE
 *     consumes:
 *       - application/json 
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *           type: string
 *           format: jwt
 *         required: true
 *       - in: path
 *         name: id
 *         description: The user ID
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true 
 *     responses:
 *       "200":
 *          description: When operation is success
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  header: 
 *                    $ref: '#/components/schemas/ResponseHeader'
 *                  body:
 *                    $ref: '#/components/schemas/UserLight' 
 *       "400":
 *         $ref: '#/components/responses/IDTokenRequired'
 *       "500":
 *         $ref: '#/components/responses/Error'  
 *   patch:
 *     tags: [User] 
 *     summary: /{id}
 *     description: Create a user, auth for ADMIN_ROLE
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *           type: string
 *           format: jwt
 *         required: true    
 *       - in: path
 *         name: id
 *         description: The user ID
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true  
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - role
 *               - isActive
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *               isActive:
 *                 type: boolean 
 *             example:
 *               firstName: Fulanito
 *               lastName: Detal
 *               email: fake@example.com
 *               password: auausasdasdsasda
 *               role:  [ADMIN_ROLE, USER_ROLE]           
 *               isActive: [true, false]
 *     responses:
 *       "200":
 *         $ref: '#/components/responses/Success'
 *       "400":
 *         $ref: '#/components/responses/IDTokenRequired'
 *       "500":
 *         $ref: '#/components/schemas/Error'
 *   delete:
 *     tags: [User] 
 *     summary: /{id}
 *     description: Delete a user, auth for ADMIN_ROLE
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         schema:
 *           type: string
 *           format: jwt
 *         required: true   
 *       - in: path
 *         name: id
 *         description: The user ID
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       "200":
 *         $ref: '#/components/responses/Success'
 *       "400":
 *         $ref: '#/components/responses/IDTokenRequired'
 *       "500":
 *         $ref: '#/components/schemas/Error'     
 */

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