import { Router } from 'express';
import { check } from 'express-validator';

import { isEmailUnique, weakPassword, isValidRol, isValidToken } from '../utils/index.js';
import { authorize } from '../middlewares/index.js';
import { fieldValidation } from '../validations/index.js';
import { signup, login, logout, loginGoogle, reAuthenticate, verifyEmail } from '../controllers/index.js';
import { tokenTypes } from '../config/tokens.enum.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: authorize
 *   description: authorizeentication
 */

/**
 * @swagger
 * /api/auths/login:
 *   post:
 *     tags: [authorize]
 *     summary: Login
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           example: [es, en]
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             example:
 *               email: fake@example.com
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
router.post(
  '/login',
  [
    check('email', 'Invalid email').isEmail(),
    check('email', "Email doesn't exists").not().custom(isEmailUnique),
    check('password', 'Password must have a valid value').not().isEmpty(),
    fieldValidation,
  ],
  login
);

router.route('/singup').post(
  //  create user
  [
    authorize(tokenTypes.ACCESS, 'ADMIN_ROLE'),
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Invalid email').isEmail(),
    check('email').custom(isEmailUnique),
    check('password').custom(weakPassword),
    check('role').custom(isValidRol),
    fieldValidation,
  ],
  signup
);

router.route('/verify-email/:token').get(
  //  create user - verify
  [
    check('token', 'token is required').not().isEmpty(),
    check('token', 'token is not valid').custom(isValidToken),
    fieldValidation,
  ],
  verifyEmail
);

router
  .route('/forgot-password')
  .post([check('email', 'Invalid email').isEmail(), check('email').custom(isEmailUnique), fieldValidation], verifyEmail);

router
  .route('/reset-password/:token')
  .post(
    [
      check('token', 'token is required').not().isEmpty(),
      check('token', 'token is not valid').custom(isValidToken),
      check('password').custom(weakPassword),
      fieldValidation,
    ],
    verifyEmail
  );

// TODO: actualizar esta entrada
/**
 * @swagger
 * /api/auths/logout:
 *   post:
 *     tags: [authorize]
 *     summary: logout
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           example: [es, en]
 *         required: true
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *           example: Bearer token
 *         required: true
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

router.route('/logout').post([authorize(tokenTypes.REFRESH, 'ADMIN_ROLE', 'USER_ROLE'), fieldValidation], logout);
router
  .route('/reauthenticate')
  .post([authorize(tokenTypes.REFRESH, 'ADMIN_ROLE', 'USER_ROLE'), fieldValidation], reAuthenticate);

/**
 * @swagger
 * /api/auths/googlelogin:
 *   post:
 *     tags: [authorize]
 *     summary: googlelogin
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           example: [es, en]
 *         required: true
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
 *         $ref: '#/components/responses/Googleauthorize401'
 */
router.route('/googlelogin').post([check('id_token', 'id_token is required').not().isEmpty(), fieldValidation], loginGoogle);

// eslint-disable-next-line import/prefer-default-export
export { router as authRouter };
