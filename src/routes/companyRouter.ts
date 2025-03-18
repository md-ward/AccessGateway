import { Router } from "express";
import { createCompany, extendApiKey } from "../controllers/companyController";
import verifyToken from "../middleware/auth";

const companyRouter = Router();
companyRouter.post("/", createCompany);
companyRouter.put("/", verifyToken, extendApiKey);

export default companyRouter;
