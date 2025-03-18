import { Router } from "express";
import { createCompany, extendApiKey } from "../controllers/companyController";
import verifyToken from "../middleware/auth";
import { loginUser, registerUser } from "../controllers/userController";

const companyRouter = Router();
companyRouter.post("/", createCompany);
companyRouter.put("/", verifyToken, extendApiKey);
companyRouter.post("/register", registerUser);

companyRouter.post("/login",loginUser);

export default companyRouter;
 