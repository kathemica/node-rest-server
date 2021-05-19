import { Router } from "express";
import { check } from "express-validator";

import fieldValidation from '../middlewares/fields-validations.js';
import {isValidRol, isEmailUnique, existsID} from '../helpers/db-validators.js';

import {authLogin} from '../controllers/auth.controller.js';

const authRouter = Router();

authRouter.post("/login", [    
    check('email', 'Invalid email').isEmail(),
    check('email', 'Email doesn\'t exists').not().custom( isEmailUnique ),
    check('password', 'Password must have a valid value').not().isEmpty(),    
    fieldValidation
],authLogin);

export {
    authRouter
}