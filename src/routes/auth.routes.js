import { Router } from 'express';
import { check } from 'express-validator';

import { isEmailUnique } from '../utils/index.js';
import { auth } from '../middlewares/index.js';
import { fieldValidation } from '../validations/index.js';
import { login, logout, loginGoogle } from '../controllers/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /api/auths/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     consumes:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             example:
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "200":
 *         $ref: '#/components/responses/Success200'
 *       "400 | 401":
 *         description: When operaton got bad input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 header:
 *                   $ref: '#/components/schemas/ResponseHeader'
 *                 body:
 *                   type: object
 *               example:
 *                 header:
 *                   code: ['400', '401']
 *                   output: [Fail, Error]
 *                   message: some message
 *                   deails: some details
 *                 body:
 *                   null
 */
router
  .route('/login')
  .post(
    [
      check('email', 'Invalid email').isEmail(),
      check('email', "Email doesn't exists").not().custom(isEmailUnique),
      check('password', 'Password must have a valid value').not().isEmpty(),
      fieldValidation,
    ],
    login
  );

// TODO: actualizar esta entrada
/**
 * @swagger
 * /api/auths/logout:
 *   post:
 *     tags: [Auth]
 *     summary: logout
 *     consumes:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             example:
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "200":
 *         $ref: '#/components/responses/Success200'
 *       "400 | 401":
 *         description: When operaton got bad input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 header:
 *                   $ref: '#/components/schemas/ResponseHeader'
 *                 body:
 *                   type: object
 *               example:
 *                 header:
 *                   code: ['400', '401']
 *                   output: [Fail, Error]
 *                   message: some message
 *                   deails: some details
 *                 body:
 *                   null
 */
router.route('/logout').post([auth('ADMIN_ROLE', 'USER_ROLE', 'SALES_ROLE'), fieldValidation], logout);

/**
 * @swagger
 * /api/auths/googlelogin:
 *   post:
 *     tags: [Auth]
 *     summary: googlelogin
 *     consumes:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_token
 *             properties:
 *               id_token:
 *                 type: string
 *             example:
 *               id_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJhYzUzNDk1NGI1NDEzOTgwNmMxMTIiLCJpYXQiOjE1ODkyOTg0ODQsImV4cCI6MTU4OTMwMDI4NH0.m1U63blB0MLej_WfB7yC2FTMnCziif9X8yzwDEfJXAg
 *     responses:
 *       "200":
 *         $ref: '#/components/responses/Success200'
 *       "400":
 *         $ref: '#/components/responses/IDTokenRequired'
 *       "401":
 *         $ref: '#/components/responses/GoogleAuth401'
 */
router.route('/googlelogin').post([check('id_token', 'id_token is required').not().isEmpty(), fieldValidation], loginGoogle);

// eslint-disable-next-line import/prefer-default-export
export { router as authRouter };
