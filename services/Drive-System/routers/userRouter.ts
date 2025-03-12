import express from "express";
import { loginUserAPI, registerUserAPI } from "../controller/userController";


const router = express.Router();

router.post("/register", registerUserAPI);

router.post("/login", loginUserAPI);

export default router;
