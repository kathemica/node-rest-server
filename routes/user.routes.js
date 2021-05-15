import {Router} from "express";

import {userGet, userPost, userPut, userPatch} from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.get("/", userGet);

userRouter.post("/", userPost);

userRouter.put("/:id", userPut);

userRouter.patch("/:id", userPatch);

export {
    userRouter
}