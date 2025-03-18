import express from "express";


import verifyToken from "../../../src/middleware/auth";
import upload from "../middlewares/multer";
import { getFileByIdAPI, uploadFileAPI } from "../controller/fileController";

const fileRouter = express.Router();

fileRouter.post("/storefile", verifyToken, upload, uploadFileAPI);
// router.get("/folder/:folderId", verifyToken, getFilesByFolderId);
fileRouter.get("/:fileId", verifyToken, getFileByIdAPI);
export default fileRouter;
