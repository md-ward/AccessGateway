import express from "express";
import { loginUserAPI, registerUserAPI } from "../controllers/userController";


const router = express.Router();

router.post("/register", registerUserAPI);

router.post("/login", loginUserAPI);

export default router;
