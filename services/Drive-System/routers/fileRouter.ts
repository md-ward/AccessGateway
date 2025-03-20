import express from "express";


import upload from "../middlewares/multer";
import { getFileByIdAPI, uploadFileAPI } from "../controller/fileController";

const fileRouter = express.Router();

fileRouter.post("/storefile", upload, uploadFileAPI);
// router.get("/folder/:folderId", getFilesByFolderId);
fileRouter.get("/:fileId", getFileByIdAPI);
export default fileRouter;
