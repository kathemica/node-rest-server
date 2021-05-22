import { Router } from "express";
import { check } from "express-validator";

import fieldValidation from '../validations/fields.validation.js';
import { isEmailUnique } from "../helpers/db-validators.js";
import {authLogin, authGoogleLogin} from '../controllers/auth.controller.js';

const router = Router();

router
    .route("/login")
    .post( [
        check('email', 'Invalid email').isEmail(),
        check('email', 'Email doesn\'t exists').not().custom( isEmailUnique ),
        check('password', 'Password must have a valid value').not().isEmpty(),    
        fieldValidation
    ],authLogin);

router
    .route("/googlelogin")
    .post([    
        check('id_token', 'id_token is required').not().isEmpty(),        
        fieldValidation
    ],authGoogleLogin);

export {
    router as authRouter
}

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
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
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       "401":
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Invalid email or password
 */