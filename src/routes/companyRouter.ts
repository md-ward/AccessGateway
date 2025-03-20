import { Router } from "express";
import { createCompany, extendApiKey } from "../controllers/companyController";
import { loginUser, registerUser } from "../controllers/userController";
import { verifyToken } from "../middleware/authCheck";

const companyRouter = Router();
companyRouter.post("/", createCompany);
companyRouter.put("/", verifyToken, extendApiKey);
companyRouter.post("/register", verifyToken, registerUser);

companyRouter.post("/login", loginUser);

export default companyRouter;
