import {Router} from "express";
// import dotenv from 'dotenv';
import {userGet, userPost, userPut, userPatch} from '../controllers/user.controller.js';

const userRouter = Router();

// dotenv.config();
// const port= process.env.PORT || 8080;

userRouter.get("/", userGet);

userRouter.post("/", userPost);

userRouter.put("/:id", userPut);

userRouter.patch("/:id", userPatch);

export {
    userRouter
}