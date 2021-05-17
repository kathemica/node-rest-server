import { Router } from "express";
import { check } from "express-validator";

import {userGet, userGetOne, userPost, userPatch, userDelete} from '../controllers/user.controller.js';
import {fieldValidation} from '../middlewares/fields-validations.js';
import {isValidRol, isEmailUnique, existsID} from '../helpers/db-validators.js';

const userRouter = Router();

userRouter.get("/", userGet);

userRouter.get("/:id", [
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom( existsID ),
    fieldValidation
], userGetOne);

userRouter.post("/",[
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),    
    check('email', 'Invalid email').isEmail(),
    check('email').custom( isEmailUnique ),
    check('password', 'Password should be greather than 6 chars').isLength({min: 6}),    
    check('role').custom( isValidRol ),    
    fieldValidation
], userPost);

userRouter.patch("/:id", [
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom( existsID ),  
    check('email', 'Invalid email').optional().isEmail(),
    check('password', 'Password should be greather than 6 chars').optional().isLength({min: 6}),
    check('role').optional().custom( isValidRol ),
    fieldValidation
], userPatch);

userRouter.delete("/:id", [
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom( existsID ),
    fieldValidation
], userDelete);

export {
    userRouter
}